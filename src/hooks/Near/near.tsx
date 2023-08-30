import { connect, Contract, keyStores, Near } from "near-api-js";
import { Buffer } from "buffer";
import {
  setupSelector,
  refreshWalletConnection,
  SelectorAccount,
} from "./walletSelector";
import { nearConfig } from "./environment";
import { FtContract, NeargenesisContract } from "./classWrappers";
import { WalletSelector } from "@near-wallet-selector/core";
import { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { NearAppConfig } from "./config";
import { MultiWalletConnection } from "./types";
import { useEffect, useState } from "react";

global.Buffer = Buffer;

export interface INearContext {
  near: Near;
  config: NearAppConfig;
  walletConnection: MultiWalletConnection;
  keyStore: any;
  neargenesisContract: NeargenesisContract;
  initFtContract: Function;
  selector: WalletSelector;
  modal: WalletSelectorModal;
  wallet: SelectorAccount;
  role: string;
}

export async function InitNearContext(): Promise<INearContext> {
  const near = await connect({
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    headers: {},
    ...nearConfig,
  });

  const walletSelector = await setupSelector(nearConfig);

  const neargenesisContract: any = new Contract(
    walletSelector.wallet,
    nearConfig.neargenesisContractId,
    {
      viewMethods: [
        "get_project",
        "get_projects",
        "get_projects_by_id",
        "get_num_balances",
        "get_withdrawn_amount",
        "get_listing_fee",
        "get_listing_fee_denominator",
        "get_astrodao_account",
        "get_admin_account_ids",
      ],
      changeMethods: [
        "set_listing_fee_denominator",
        "project_withdraw_in_token",
        "project_withdraw_out_token",
        "remove_project",
        "publish_project",
        "unpublish_project",
        "update_project",
      ],
    }
  );

  const initFtContract = (contractId: string) => {
    return new Contract(walletSelector.wallet, contractId, {
      viewMethods: ["ft_balance_of", "ft_metadata", "storage_balance_of"],
      changeMethods: ["ft_transfer_call", "storage_deposit"],
    });
  };

  const keyStore = new keyStores.BrowserLocalStorageKeyStore();

  const walletConnection = await refreshWalletConnection(
    walletSelector.selector,
    keyStore,
    nearConfig
  );

  return {
    near,
    config: nearConfig,
    walletConnection,
    keyStore,
    neargenesisContract: new NeargenesisContract(
      neargenesisContract,
      near,
      walletSelector.selector
    ),
    initFtContract,
    selector: walletSelector.selector,
    modal: walletSelector.modal,
    wallet: walletSelector.wallet,
    role: "user",
  };
}
