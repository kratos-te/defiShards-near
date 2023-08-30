import { SelectorAccount } from "./walletSelector";
import { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { useContext, createContext, useState, useEffect } from "react";
import { Contract, Near } from "near-api-js";
import { Buffer } from "buffer";
import { NearAppConfig } from "./config";
import { WalletSelector } from "@near-wallet-selector/core";
import { MultiWalletConnection } from "./types";
import { useSearchParams } from "react-router-dom";
import { nearConfig } from "./environment";
import { refreshWalletConnection } from "./walletSelector";
import { NeargenesisContract, FtContract } from "./classWrappers";
import { INearContext } from "./near";

export const NearContext = createContext<INearContext | null>(null);

export const useNearContext = (
  onSignOut?: () => Promise<void>
): INearContext => {
  const [walletConnection, setWalletConnection] =
    useState<MultiWalletConnection | null>(null);
  const [role, setRole] = useState<string>("user");
  const [admin, setAdmin] = useState<string[]>([]);
  const context = useContext(NearContext);
  if (context === null) {
    throw new Error("useNear must be used within a NearProvider.");
  }

  const getAdmin = async () => {
    console.log("-------", context.walletConnection.isLoggedIn);
    if (!context.walletConnection.accountId) {
      console.log("I am here");
      return;
    }
    if (!context.walletConnection.isLoggedIn) setRole("user");
    const adminIds = await context.neargenesisContract.getAdminAccountIds();
    const role = adminIds.includes(context.walletConnection.accountId)
      ? "admin"
      : "user";
    setRole(role);
  };

  useEffect(() => {
    getAdmin();
  }, [context]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshWalletConnection(
        context.selector,
        context.keyStore,
        context.config
      ).then((_walletConnection) => {
        if (
          walletConnection == null ||
          _walletConnection.isLoggedIn !== walletConnection.isLoggedIn ||
          _walletConnection.accountId !== walletConnection.accountId
        ) {
          if (!_walletConnection.isLoggedIn) {
            if (onSignOut) {
              onSignOut();
            }
          }

          setWalletConnection({
            ..._walletConnection,
            signOut: async () => {
              return await _walletConnection.signOut();
            },
          });
        }
      });
      context.wallet.refresh(context.selector);
    }, 200);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnection]);

  return {
    ...context,
    walletConnection: walletConnection || context.walletConnection,
    role: role,
  };
};

export function useNearLogin() {
  const context = useNearContext();

  const accountId = context.walletConnection.accountId;

  const signInNear = () => {
    context.modal.show();
  };

  const signOutNear = () => {
    context.walletConnection.signOut();
  };

  return {
    isLoggedInNear: context.walletConnection.isLoggedIn,
    accountIdNear: accountId || "",
    signInNear,
    signOutNear,
  };
}

export const useNearLinks = () => {
  const getAccountExplorer = (accountId: string) => {
    return `${nearConfig.explorerUrl}/accounts/${accountId}`;
  };

  return {
    getAccountExplorer,
  };
};

interface RawFunctionCall {
  argsB64: string;
  gas: number;
  deposit: string;
  methodName: string;
}

type TxOutcomeSuccess = {
  success: true;
  successValue: any;
  originalFunctionCall?: RawFunctionCall;
  txHash: string;
};

type TxOutcomeFailed = {
  success: false;
  errorCode: string;
  errorMessage: string;
  originalFunctionCall?: RawFunctionCall;
  txHash?: string;
};

type TxOutcome = TxOutcomeSuccess | TxOutcomeFailed;

export const useTxOutcome = (onTxOutcome: (outcome: TxOutcome) => void) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useNearContext();

  const { near, walletConnection } = context;

  const getTxOutcome = async (txHash: string): Promise<TxOutcome> => {
    const result = await near.connection.provider.txStatus(
      txHash,
      walletConnection.accountId || ""
    );
    if (result.transaction.actions.length > 0) {
      console.warn("Handling multiple TXs are not supported in TX Outcome");
    }
    const action = result.transaction.actions[0];
    const originalCall: RawFunctionCall | undefined = action.FunctionCall
      ? {
          argsB64: action.FunctionCall.args,
          deposit: action.FunctionCall.deposit,
          gas: action.FunctionCall.gas,
          methodName: action.FunctionCall.method_name,
        }
      : undefined;

    if ("SuccessValue" in (result.status as any)) {
      try {
        const successValue = JSON.parse(
          Buffer.from((result.status as any).SuccessValue, "base64").toString()
        );
        return {
          success: true,
          successValue,
          originalFunctionCall: originalCall,
          txHash,
        };
      } catch {}
      return {
        success: true,
        successValue: null,
        originalFunctionCall: originalCall,
        txHash,
      };
    }
    return {
      success: false,
      errorCode: "txFailed",
      errorMessage: "Transaction failed",
      originalFunctionCall: originalCall,
      txHash,
    };
  };

  const parseTxFailed = (
    errorCode: string,
    errorMessage: string
  ): TxOutcome => {
    const decodedError = decodeURIComponent(errorMessage);
    if (decodedError.startsWith(`{"index"`)) {
      try {
        const parsed = decodedError.endsWith("}")
          ? JSON.parse(decodedError)
          : JSON.parse(`${decodedError}"}}`);
        if ("kind" in parsed && "ExecutionError" in parsed.kind) {
          return {
            success: false,
            errorCode,
            errorMessage: parsed.kind.ExecutionError,
          };
        }
      } catch {}
    }

    return {
      success: false,
      errorCode,
      errorMessage: decodedError,
    };
  };

  useEffect(() => {
    const txHashes = searchParams.get("transactionHashes") || "";
    searchParams.delete("transactionHashes");
    const errorCode = searchParams.get("errorCode");
    searchParams.delete("errorCode");
    const errorMessage = searchParams.get("errorMessage") || "";
    searchParams.delete("errorMessage");
    if (txHashes || errorCode || errorMessage) {
      setSearchParams(searchParams);
    }

    if (txHashes) {
      const [txHash] = txHashes.split(",");
      getTxOutcome(txHash).then(onTxOutcome);
    }
    if (errorCode) {
      const txOutcome = parseTxFailed(errorCode, errorMessage);
      onTxOutcome(txOutcome);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
};
