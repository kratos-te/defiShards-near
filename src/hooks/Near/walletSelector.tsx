import { CodeResult } from "near-api-js/lib/providers/provider";
import { Provider } from "near-api-js/lib/providers";
import { Account, Connection, providers } from "near-api-js";
import { Wallet } from "@near-wallet-selector/core";
import { NetworkId, setupWalletSelector } from "@near-wallet-selector/core";
import { WalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNarwallets } from "@near-wallet-selector/narwallets";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupNightlyConnect } from "@near-wallet-selector/nightly-connect";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupOptoWallet } from "@near-wallet-selector/opto-wallet";
import { setupFinerWallet } from "@near-wallet-selector/finer-wallet";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupXDEFI } from "@near-wallet-selector/xdefi";
import { NearAppConfig } from "./config";
import {
  AccessKeyInfoView,
  AccessKeyView,
  AccountView,
  BlockId,
  FinalExecutionOutcome,
  Finality,
} from "near-api-js/lib/providers/provider";
import { Action, SignedTransaction } from "near-api-js/lib/transaction";
import {
  AccountAuthorizedApp,
  AccountBalance,
  FunctionCallOptions,
  SignAndSendTransactionOptions,
} from "near-api-js/lib/account";
import { PublicKey } from "near-api-js/lib/utils";
import BN from "bn.js";
import { MultiWalletConnection } from "./types";
import { bytesToHex } from "./utils";
import bs58 from "bs58";
import { sha256 } from "js-sha256";

function parseJsonFromRawResponse(response: Uint8Array): any {
  return JSON.parse(Buffer.from(response).toString());
}

function bytesJsonStringify(input: any): Buffer {
  return Buffer.from(JSON.stringify(input));
}

export const DEFAULT_FUNCTION_CALL_GAS = new BN("30000000000000");

export class SelectorAccount extends Account {
  wallet: Wallet | null;
  readonly provider: Provider;
  realAccountId: string | null;

  constructor(
    wallet: Wallet | null,
    config: NearAppConfig,
    accountId: string | null
  ) {
    super(null as unknown as Connection, accountId || "");
    this.realAccountId = accountId;
    this.wallet = wallet;
    this.provider = new providers.JsonRpcProvider({ url: config.nodeUrl });
  }

  async refresh(selector: WalletSelector) {
    if (selector.isSignedIn()) {
      this.wallet = await selector.wallet();
    } else {
      this.wallet = null;
    }
    this.realAccountId =
      selector.store.getState().accounts.find((acc) => acc.active)?.accountId ||
      null;
  }

  override async state(): Promise<AccountView> {
    return this.provider.query<AccountView>({
      request_type: "view_account",
      account_id: this.realAccountId || "",
      finality: "optimistic",
    });
  }

  override async signTransaction(
    receiverId: string,
    actions: Action[]
  ): Promise<[Uint8Array, SignedTransaction]> {
    throw new Error("Not implemented");
  }

  override async signAndSendTransaction({
    receiverId,
    actions,
  }: SignAndSendTransactionOptions): Promise<FinalExecutionOutcome>;
  override async signAndSendTransaction(
    receiverId: string,
    actions: Action[]
  ): Promise<FinalExecutionOutcome>;
  override async signAndSendTransaction(
    receiverId: any,
    actions?: any
  ): Promise<import("@near-wallet-selector/core").FinalExecutionOutcome> {
    if (this.wallet == null) {
      throw new Error("Not logged in");
    }
    const res = await this.wallet.signAndSendTransaction({
      signerId: this.realAccountId || "",
      actions: actions,
      receiverId: receiverId,
    });
    return res!;
  }

  override async findAccessKey(
    receiverId: string,
    actions: Action[]
  ): Promise<{ publicKey: PublicKey; accessKey: AccessKeyView }> {
    throw new Error("Not supported");
  }

  override async createAndDeployContract(
    contractId: string,
    publicKey: string | PublicKey,
    data: Uint8Array,
    amount: BN
  ): Promise<Account> {
    throw new Error("Not supported");
  }

  override async sendMoney(
    receiverId: string,
    amount: BN
  ): Promise<FinalExecutionOutcome> {
    throw new Error("Not supported");
  }

  override async createAccount(
    newAccountId: string,
    publicKey: string | PublicKey,
    amount: BN
  ): Promise<FinalExecutionOutcome> {
    throw new Error("Not supported");
  }

  override async deleteAccount(
    beneficiaryId: string
  ): Promise<FinalExecutionOutcome> {
    throw new Error("Not supported");
  }

  override async deployContract(
    data: Uint8Array
  ): Promise<FinalExecutionOutcome> {
    throw new Error("Not supported");
  }

  override async functionCall(
    props: FunctionCallOptions
  ): Promise<FinalExecutionOutcome>;
  override async functionCall(
    contractId: string,
    methodName: string,
    args: any,
    gas?: any,
    amount?: any
  ): Promise<FinalExecutionOutcome>;
  override async functionCall(
    contractId: any,
    methodName?: any,
    args?: any,
    gas?: any,
    amount?: any
  ): Promise<FinalExecutionOutcome> {
    if (this.wallet == null) {
      throw new Error("Not logged in");
    }

    if (typeof contractId === "object") {
      const props = contractId as unknown as FunctionCallOptions;
      console.log(methodName, args, gas, amount, contractId);

      return (await this.wallet.signAndSendTransaction({
        signerId: this.realAccountId || "",
        receiverId: props.contractId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: props.methodName,
              args: props.args,
              gas:
                props.gas?.toString() || DEFAULT_FUNCTION_CALL_GAS.toString(),
              deposit: props.attachedDeposit?.toString() || "0",
            },
          },
        ],
      })) as unknown as FinalExecutionOutcome;
    } else {
      return (await this.wallet.signAndSendTransaction({
        signerId: this.realAccountId || "",
        receiverId: contractId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: methodName,
              args: args,
              gas: gas,
              deposit: amount,
            },
          },
        ],
      })) as unknown as FinalExecutionOutcome;
    }
  }

  override async addKey(
    publicKey: string | PublicKey,
    contractId?: string,
    methodNames?: string | string[],
    amount?: any
  ): Promise<FinalExecutionOutcome> {
    throw new Error("Not supported");
  }

  override async deleteKey(
    publicKey: string | PublicKey
  ): Promise<FinalExecutionOutcome> {
    throw new Error("Not supported");
  }

  override async stake(
    publicKey: string | PublicKey,
    amount: BN
  ): Promise<FinalExecutionOutcome> {
    throw new Error("Not supported");
  }

  override async viewFunction(
    contractId: string,
    methodName: string,
    args: any,
    {
      parse,
      stringify,
      jsContract,
    }: {
      parse: ((response: Uint8Array) => any) | undefined;
      stringify: ((input: any) => Buffer) | undefined;
      jsContract: boolean | undefined;
    }
  ): Promise<any> {
    parse = parse || parseJsonFromRawResponse;
    stringify = stringify || bytesJsonStringify;
    jsContract = jsContract || false;

    const result: CodeResult = await this.provider.query({
      request_type: "call_function",
      account_id: contractId,
      method_name: methodName,
      args_base64: args
        ? Buffer.from(JSON.stringify(args)).toString("base64")
        : "",
      finality: "optimistic",
    });

    return JSON.parse(Buffer.from(result.result).toString());
  }

  override async viewState(
    prefix: string | Uint8Array,
    blockQuery?: { blockId: BlockId } | { finality: Finality }
  ): Promise<{ key: Buffer; value: Buffer }[]> {
    throw new Error("Not supported");
  }

  override async getAccessKeys(): Promise<AccessKeyInfoView[]> {
    throw new Error("Not supported");
  }

  override async getAccountDetails(): Promise<{
    authorizedApps: AccountAuthorizedApp[];
  }> {
    throw new Error("Not supported");
  }

  override async getAccountBalance(): Promise<AccountBalance> {
    throw new Error("Not supported");
  }
}

export const setupSelector = async (config: NearAppConfig) => {
  const _selector = await setupWalletSelector({
    network: config.networkId as NetworkId,
    debug: config.networkId === "testnet",
    modules: [
      setupNearWallet(),
      setupMyNearWallet(),
      setupSender(),
      setupHereWallet(),
      setupMathWallet(),
      setupNightly(),
      setupMeteorWallet(),
      setupNarwallets(),
      setupWelldoneWallet(),
      setupLedger(),
      setupNearFi(),
      setupCoin98Wallet(),
      setupOptoWallet(),
      setupFinerWallet(),
      setupNeth(),
      setupXDEFI(),
      setupWalletConnect({
        projectId: "c4f79cc...",
        metadata: {
          name: "NEAR Wallet Selector",
          description: "Example dApp used by NEAR Wallet Selector",
          url: "https://github.com/near/wallet-selector",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
      }),
      setupNightlyConnect({
        url: "wss://relay.nightly.app/app",
        appMetadata: {
          additionalInfo: "",
          application: "NEAR Wallet Selector",
          description: "Example dApp used by NEAR Wallet Selector",
          icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
        },
      }),
    ],
  });
  const _modal = setupModal(_selector, {
    contractId: config.neargenesisContractId,
  });
  const state = _selector.store.getState();
  const accounts = state.accounts;

  return {
    selector: _selector,
    modal: _modal,
    wallet: new SelectorAccount(
      _selector.isSignedIn() ? await _selector.wallet() : null,
      config,
      accounts.find((acc) => acc.active)?.accountId || null
    ),
  };
};

export const refreshWalletConnection = async (
  selector: WalletSelector,
  keyStore: any,
  config: NearAppConfig
): Promise<MultiWalletConnection> => {
  const isLoggedIn = selector.isSignedIn();
  const account =
    selector.store.getState().accounts.find((acc) => acc.active)?.accountId ||
    null;
  const signOut = async () => {
    if (!isLoggedIn) {
      return;
    }
    const wallet = await selector.wallet();
    await wallet.signOut();
  };

  const _sign = async (keyPair: any, content: string) => {
    const msg = Buffer.from(sha256.array(content));
    const { signature } = keyPair.sign(msg);
    return bytesToHex(signature);
  };

  const sign = async (message: string) => {
    const wallet = await selector.wallet();
    if (wallet.id === "meteor-wallet") {
      const result = await wallet.verifyOwner({ message });
      if (!result) {
        throw new Error("Failed to create signature");
      }

      const msg = JSON.stringify({
        accountId: result.accountId,
        message: result.message,
        blockId: result.blockId,
        publicKey: result.publicKey,
        keyType: result.keyType,
      });

      const publicKey = `ed25519:${bs58.encode(
        Buffer.from(result.publicKey, "base64")
      )}`;

      return {
        accountId: result.accountId,
        message: msg,
        publicKey: publicKey,
        signature: Buffer.from(result.signature, "base64").toString("hex"),
      };
    } else {
      const accountId = account || "";
      const keyPair = await keyStore.getKey(config.networkId, accountId);

      const publicKey = keyPair.publicKey.toString();

      const signature = await _sign(keyPair, message);

      return {
        accountId,
        message,
        publicKey,
        signature,
      };
    }
  };

  return {
    isLoggedIn,
    accountId: account,
    signOut,
    sign,
  };
};
