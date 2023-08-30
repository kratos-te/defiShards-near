import { FtTokenDetail } from "../types/listing";
import USDT from "../assets/img/icons/usdt.svg"
import USDC from "../assets/img/icons/usdc.svg"
import wNEAR from "../assets/img/icons/wnear.svg"

export const tokenAddresses = ["wrap.testnet", "usdt.fakes.testnet", "usdc.fakes.testnet"]
export const usdt: FtTokenDetail = {
  name: 'Tether USD',
  symbol: 'USDT.e',
  icon: USDT,
  supply: 541025,
  price: 0,
  contractId: ''
};

export const wnear: FtTokenDetail = {
  name: 'Wrapped Near',
  symbol: 'wNEAR',
  icon: wNEAR,
  supply: 541025,
  price: 0,
  contractId: 'wrap.testnet'
};

export const usdc: FtTokenDetail = {
  name: 'USD Coin',
  symbol: 'USDC',
  icon: USDC,
  supply: 13892458,
  price: 0,
  contractId: ''
};
