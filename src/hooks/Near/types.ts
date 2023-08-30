import { FtContract } from "./classWrappers";

export type RaffleId = number;

export interface MultiWalletConnection {
  isLoggedIn: boolean;
  accountId: string | null;
  signOut: () => Promise<void>;
  sign: (message: string) => Promise<SignOutcome>;
}

export interface SignOutcome {
  accountId: string;
  message: string;
  publicKey: string;
  signature: string;
}

export interface FtToken {
  contractId: string;
  symbol: string;
  decimals: number;
  name: string;
  icon?: string;
}

export const nearFtMetadata: FtToken = {
  contractId: "near",
  name: "near",
  symbol: "near",
  decimals: 24,
};

export interface Investors {
  accountId: string;
  balance: number;
}

export interface Project {
  project_id: number;
  owner_id: string;
  title: string;
  sub_title: string;
  logo: string;
  starting_price: string;
  email: string;
  telegram: string;
  in_token_account_id: string;
  in_token_decimals: number;
  out_token_account_id: string;
  out_token_decimals: number;
  total_tokens: string;
  coingecko: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  description: string;
  start_time: number;
  end_time: number;
  cliff_period: number;
  total_deposits: string;
  current_block_height: string;
  start_block_height: string;
  end_block_height: string | null;
  is_activated: boolean;
  is_published: boolean;
  investors: number;
}

export interface ProjectInput {
  title: string;
  subTitle: string;
  outTokenId: string;
  inTokenId: string;
  logo: string;
  startingPrice: number;
  email: string;
  telegram: string;
  totalTokens: number;
  coingecko: string;
  facebook: string;
  instagram: string;
  twitter: string;
  description: string;
  startTime: number;
  endTime: number;
  cliffPeriod: number;
}

export interface RegisterProjectParameters extends ProjectInput {
  accountId: string;
  inTokenContract: FtContract;
  outTokenContract: FtContract;
  paymentTokenContract: FtContract;
}

export interface DepositProjectParameters {
  accountId: string;
  projectId: number;
  ftContract: FtContract;
  amount: number;
}

export interface WithdrawProjectParameters {
  projectId: number;
  amount: number | null;
  ftContract: FtContract;
}
