export interface FtTokenDetail {
  name: string
  symbol: string
  icon: string
  supply: number
  price: number
  contractId: string
}

export interface ListingDetail {
  fromToken: FtTokenDetail
  toToken: FtTokenDetail
  startTime: number
  endTime: number
  progress: number
}