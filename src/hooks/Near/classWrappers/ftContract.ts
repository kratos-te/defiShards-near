import { formatNearAmount } from "near-api-js/lib/utils/format";
import { unifySymbol } from "../utils";
import { GAS_FOR_NFT_TRANSFER, STORAGE_AMOUNT } from "../constants";
import { FtToken } from "../types";
import { ContractFactory } from "./contractFactory";
import { convertToFloat } from "../../../utils/convert";

export class FtContract {
  private contract: any;
  contractId: string;
  constructor(ftContract: any) {
    this.contract = ftContract;
    this.contractId = ftContract.contractId;
  }

  getFtBalanceOfOwner = async (accountId?: string): Promise<string> => {
    if (!accountId) {
      return "0";
    }
    return await this.contract.ft_balance_of({ account_id: accountId });
  };

  getFtMetadata = async (): Promise<FtToken> => {
    const metadata = await this.contract.ft_metadata();
    return {
      ...metadata,
      contractId: this.contract.contractId,
      symbol: unifySymbol(metadata.symbol),
    };
  };

  getFtBalanceOfOwnerFormatted = async (accountId: string): Promise<number> => {
    const [balanceForOwner, metadata] = await Promise.all([
      this.getFtBalanceOfOwner(accountId),
      this.getFtMetadata(),
    ]);

    const balance = convertToFloat(balanceForOwner, 5, metadata.decimals);
    return balance;
  };

  ftTransferCall = (receiverId: string, amount: string, msg: string) =>
    this.contract.ft_transfer_call({
      args: {
        receiver_id: receiverId,
        amount: amount,
        msg: msg,
      },
      gas: GAS_FOR_NFT_TRANSFER,
      amount: "1",
    });

  storageDeposit = (accountId: string) =>
    this.contract.storage_deposit({
      args: {
        account_id: accountId,
      },
      amount: STORAGE_AMOUNT,
    });

  storageBalance = async (accountId: string) => {
    return await this.contract.storage_balance_of({
      account_id: accountId,
    });
  };
}

export type FtContractFactory = ContractFactory<FtContract>;
