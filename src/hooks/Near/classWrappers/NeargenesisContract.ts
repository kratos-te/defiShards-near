import BigNumber from "big.js";
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { unifySymbol } from "../utils";
import { GAS_FOR_NFT_TRANSFER, STORAGE_AMOUNT } from "../constants";
import { Project } from "../types";

import { Contract, Near } from "near-api-js";
import { FtContractFactory, FtContract } from "./ftContract";
import { WalletSelector } from "@near-wallet-selector/core";
import { TimeDivision } from "../../../utils/const";
import {
  cutDecimal,
  convertToFloat,
  convertToAmount,
} from "../../../utils/convert";

const FETCH_COUNT = 50;

export class NeargenesisContract {
  neargenesisContract: any;
  near: Near;
  selector: WalletSelector;

  constructor(neargenesisContract: any, near: Near, selector: WalletSelector) {
    this.neargenesisContract = neargenesisContract;
    this.near = near;
    this.selector = selector;
  }

  getProject = async (project_id: number): Promise<Project> => {
    const res = await this.neargenesisContract.get_project({
      project_id: project_id,
    });
    return res;
  };

  getProjects = async (
    from_index: number | null,
    limit: number | null
  ): Promise<Array<Project>> => {
    const res = await this.neargenesisContract.get_projects({
      from_index,
      limit,
    });
    return res;
  };

  getProjectsById = async (
    project_ids: Array<number>
  ): Promise<Array<Project>> => {
    return await this.neargenesisContract.get_projects_by_id({ project_ids });
  };

  getNumBalances = async (
    project_id: number,
    account_id: string
  ): Promise<string> => {
    return await this.neargenesisContract.get_num_balances({
      project_id,
      account_id,
    });
  };

  getWithdrawnAmount = async (
    project_id: number,
    account_id: string
  ): Promise<string> => {
    return await this.neargenesisContract.get_withdrawn_amount({
      project_id,
      account_id,
    });
  };

  getListingFee = async (): Promise<number> => {
    return await this.neargenesisContract.get_listing_fee();
  };

  getListingFeeDenominator = async (): Promise<number> => {
    return await this.neargenesisContract.get_listing_fee_denominator();
  };

  getAstroDaoAccount = async (): Promise<string> => {
    return await this.neargenesisContract.get_astrodao_account();
  };
  getAdminAccountIds = async (): Promise<string[]> => {
    return await this.neargenesisContract.get_admin_account_ids();
  };

  registerProject = async (
    accoun_id: string,
    inTokenContract: FtContract,
    outTokenContract: FtContract,
    paymentTokenContract: FtContract,
    title: string,
    sub_title: string,
    logo: string,
    starting_price: number,
    email: string,
    telegram: string,
    in_token_account_id: string,
    out_token_account_id: string,
    total_tokens: number,
    coingecko: string,
    facebook: string,
    instagram: string,
    twitter: string,
    description: string,
    start_time: number,
    end_time: number,
    cliff_period: number
  ) => {
    console.log("here");
    const projectRegisterFee = BigInt(await this.getListingFee());
    const callbackUrl = `${window.location.origin}/#/project/`;
    const balance = await inTokenContract!.getFtBalanceOfOwner(
      this.neargenesisContract.contractId
    );
    const inTokenMetadata = await inTokenContract!.getFtMetadata();
    const outTokenMetadata = await outTokenContract!.getFtMetadata();
    const paymentTokenMetadata = await paymentTokenContract!.getFtMetadata();
    const projectRegisterValue = convertToAmount(
      Number(projectRegisterFee),
      paymentTokenMetadata.decimals
    );
    const attachDeposit = projectRegisterValue;
    const totalTokens = convertToAmount(
      total_tokens,
      outTokenMetadata.decimals
    );

    const msg = JSON.stringify({
      msg_type: true,
      msg_data: JSON.stringify({
        title,
        sub_title,
        logo,
        starting_price: convertToAmount(
          starting_price,
          inTokenMetadata.decimals
        ),
        email,
        telegram,
        in_token_account_id,
        in_token_decimals: inTokenMetadata.decimals,
        out_token_account_id,
        out_token_decimals: outTokenMetadata.decimals,
        total_tokens: totalTokens,
        coingecko,
        facebook,
        instagram,
        twitter,
        description,
        start_time: (start_time * TimeDivision).toString(),
        end_time: (end_time * TimeDivision).toString(),
        cliff_period: (cliff_period * TimeDivision).toString(),
      }),
    });
    console.log(BigNumber(balance));
    const account: any = await this.near.account(accoun_id);
    const wallet = await this.selector.wallet();
    const accounts = await wallet.getAccounts();
    if (BigNumber(balance) > BigNumber(0)) {
      // return await inTokenContract.ftTransferCall(this.neargenesisContract.contractId, attachDeposit.toString(), msg, callbackUrl);
      const outcome = await wallet.signAndSendTransactions({
        transactions: [
          {
            signerId: accounts[0].accountId,
            receiverId: paymentTokenMetadata.contractId,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "ft_transfer_call",
                  args: {
                    receiver_id: this.neargenesisContract.contractId,
                    amount: attachDeposit.toString(),
                    msg,
                  },
                  gas: GAS_FOR_NFT_TRANSFER,
                  deposit: "1",
                },
              },
            ],
          },
        ],
        callbackUrl,
      });
      if (!outcome || (outcome && outcome.length) !== 1) {
        throw new Error("TX Failed");
      }
      const [activateOutcome] = outcome;
      if (!("SuccessValue" in (activateOutcome.status as any))) {
        throw new Error("TX Failed");
      }

      return JSON.parse(
        Buffer.from(
          (activateOutcome.status as any).SuccessValue,
          "base64"
        ).toString()
      );
    } else {
      const outcome = await wallet.signAndSendTransactions({
        transactions: [
          {
            signerId: accounts[0].accountId,
            receiverId: paymentTokenMetadata.contractId,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "storage_deposit",
                  args: {
                    account_id: this.neargenesisContract.contractId,
                    registration_only: true,
                  },
                  gas: "30000000000000",
                  deposit: STORAGE_AMOUNT,
                },
              },
            ],
          },
          {
            signerId: accounts[0].accountId,
            receiverId: paymentTokenMetadata.contractId,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "ft_transfer_call",
                  args: {
                    receiver_id: this.neargenesisContract.contractId,
                    amount: attachDeposit.toString(),
                    msg,
                  },
                  gas: GAS_FOR_NFT_TRANSFER,
                  deposit: "1",
                },
              },
            ],
          },
        ],
        callbackUrl,
      });
      if (!outcome || (outcome && outcome.length) !== 2) {
        throw new Error("TX Failed");
      }
      const [createOutcome, activateOutcome] = outcome;
      if (
        !("SuccessValue" in (createOutcome.status as any)) ||
        !("SuccessValue" in (activateOutcome.status as any))
      ) {
        throw new Error("TX Failed");
      }

      return JSON.parse(
        Buffer.from(
          (activateOutcome.status as any).SuccessValue,
          "base64"
        ).toString()
      );
    }
  };

  activeProject = async (
    accoun_id: string,
    project_id: number,
    outTokenContract: FtContract,
    amount: number
  ) => {
    console.log("contracId is ", this.neargenesisContract.contractId);
    const storageBalance = await outTokenContract!.storageBalance(
      this.neargenesisContract.contractId
    );
    console.log("balance is ", storageBalance);
    const outTokenMetadata = await outTokenContract!.getFtMetadata();
    const projectActiveValue = convertToAmount(
      amount,
      outTokenMetadata.decimals
    );
    const attachDeposit = projectActiveValue;

    const msg = JSON.stringify({
      msg_type: false,
      msg_data: JSON.stringify({
        project_id,
      }),
    });

    const wallet = await this.selector.wallet();
    const accounts = await wallet.getAccounts();

    if (storageBalance && storageBalance.total && storageBalance.total != "0") {
      if (!attachDeposit) return;
      const outcome = await outTokenContract.ftTransferCall(
        this.neargenesisContract.contractId,
        attachDeposit,
        msg
      );
      if (!outcome) {
        throw new Error("TX Failed");
      }
      if (!("SuccessValue" in (outcome.status as any))) {
        throw new Error("TX Failed");
      }

      return JSON.parse(
        Buffer.from((outcome.status as any).SuccessValue, "base64").toString()
      );
    } else {
      const outcome = await wallet.signAndSendTransactions({
        transactions: [
          {
            signerId: accounts[0].accountId,
            receiverId: outTokenContract.contractId,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "storage_deposit",
                  args: {
                    account_id: this.neargenesisContract.contractId,
                    registration_only: true,
                  },
                  gas: "30000000000000",
                  deposit: STORAGE_AMOUNT,
                },
              },
            ],
          },
          {
            signerId: accounts[0].accountId,
            receiverId: outTokenContract.contractId,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "ft_transfer_call",
                  args: {
                    receiver_id: this.neargenesisContract.contractId,
                    amount: attachDeposit,
                    msg,
                  },
                  gas: GAS_FOR_NFT_TRANSFER,
                  deposit: "1",
                },
              },
            ],
          },
        ],
      });

      if (!outcome || outcome.length !== 2) {
        throw new Error("TX Failed");
      }
      const [createOutcome, activateOutcome] = outcome;
      if (
        !("SuccessValue" in (createOutcome.status as any)) ||
        !("SuccessValue" in (activateOutcome.status as any))
      ) {
        throw new Error("TX Failed");
      }

      return JSON.parse(
        Buffer.from(
          (createOutcome.status as any).SuccessValue,
          "base64"
        ).toString()
      );
    }
  };

  projectDepositInToken = async (
    accoun_id: string,
    project_id: number,
    ftContract: FtContract,
    amount: number
  ) => {
    const callbackUrl = `${window.location.origin}/#/listing/${project_id}`;
    const outTokenMetadata = await ftContract!.getFtMetadata();
    const withdrawValue = convertToAmount(amount, outTokenMetadata.decimals);
    const attachDeposit = withdrawValue;

    const msg = JSON.stringify({
      msg_type: false,
      msg_data: JSON.stringify({
        project_id,
      }),
    });

    const wallet = await this.selector.wallet();
    const accounts = await wallet.getAccounts();
    const outcome = await wallet.signAndSendTransactions({
      transactions: [
        {
          signerId: accounts[0].accountId,
          receiverId: ftContract.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "storage_deposit",
                args: {
                  account_id: this.neargenesisContract.contractId,
                  registration_only: true,
                },
                gas: "30000000000000",
                deposit: STORAGE_AMOUNT,
              },
            },
          ],
        },
        {
          signerId: accounts[0].accountId,
          receiverId: ftContract.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "ft_transfer_call",
                args: {
                  receiver_id: this.neargenesisContract.contractId,
                  amount: attachDeposit,
                  msg,
                },
                gas: GAS_FOR_NFT_TRANSFER,
                deposit: "1",
              },
            },
          ],
        },
      ],
      callbackUrl,
    });
    if (!outcome || outcome.length !== 2) {
      throw new Error("TX Failed");
    }
    const [createOutcome, activateOutcome] = outcome;
    if (
      !("SuccessValue" in (createOutcome.status as any)) ||
      !("SuccessValue" in (activateOutcome.status as any))
    ) {
      throw new Error("TX Failed");
    }

    return JSON.parse(
      Buffer.from(
        (createOutcome.status as any).SuccessValue,
        "base64"
      ).toString()
    );
  };

  projectWithdrawInToken = async (
    project_id: number,
    amount: number | null,
    inTokenContract: FtContract
  ) => {
    const callbackUrl = `${window.location.origin}/#/listing/${project_id}`;

    const inTokenMetadata = await inTokenContract!.getFtMetadata();
    const withdrawValue = convertToAmount(amount!, inTokenMetadata.decimals);
    const withdrawAmount = withdrawValue;

    return await this.neargenesisContract.project_withdraw_in_token({
      args: {
        project_id,
        amount: withdrawAmount,
      },
      amount: 1,
      // attachDeposit: parseNearAmount('1'),
      callbackUrl,
    });
  };

  projectWithdrawOutToken = async (
    project_id: number,
    amount: number | null,
    outTokenContract: FtContract
  ) => {
    const callbackUrl = `${window.location.origin}/#/detail/${project_id}`;
    const outTokenMetadata = await outTokenContract!.getFtMetadata();

    const wallet = await this.selector.wallet();
    const accounts = await wallet.getAccounts();
    const outcome = await wallet.signAndSendTransactions({
      transactions: [
        {
          signerId: accounts[0].accountId,
          receiverId: outTokenContract.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "storage_deposit",
                args: {
                  account_id: accounts[0].accountId,
                  registration_only: true,
                },
                gas: "30000000000000",
                deposit: STORAGE_AMOUNT,
              },
            },
          ],
        },
        {
          signerId: accounts[0].accountId,
          receiverId: this.neargenesisContract.contractId,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "project_withdraw_out_token",
                args: {
                  project_id,
                },
                gas: GAS_FOR_NFT_TRANSFER,
                deposit: "1",
              },
            },
          ],
        },
      ],
      callbackUrl,
    });
  };

  removeProject = async (project_id: number) => {
    return await this.neargenesisContract.remove_project({
      args: { project_id },
      amount: "1",
    });
  };

  updateProject = async (project_id: number, project_input: any) => {
    return await this.neargenesisContract.update_project({
      args: { project_id, project_input },
      amount: "1",
    });
  };

  publishProject = async (project_id: number) => {
    return await this.neargenesisContract.publish_project({
      args: { project_id },
      amount: "1",
    });
  };

  hideProject = async (project_id: number) => {
    return await this.neargenesisContract.unpublish_project({
      args: { project_id },
      amount: "1",
    });
  };
}
