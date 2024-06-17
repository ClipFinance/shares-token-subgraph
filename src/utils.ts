import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {  SharePrice, User, UserShare, NFT, Cycle } from "../generated/schema";
import { ERC20 } from "../generated/templates/PCLBaseSwapInside/ERC20";
import { ReceiptNFT } from "../generated/ReceiptNFT/ReceiptNFT";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const STRATEGY_ROUTER = "0x03A074D130144FcE6883F7EA3884C0a783d85Fb3";

export function getUserShares(id: Bytes, contract: Bytes): UserShare {
  const userShares = UserShare.load(id.concat(contract));
  if (userShares !== null) {
    return userShares as UserShare;
  }

  const newUserShares = new UserShare(id.concat(contract));
  newUserShares.shares0 = BigInt.zero();
  newUserShares.shares1 = BigInt.zero();
  return newUserShares;
}

export function getUser(id: Bytes, contract: Bytes, token: Address): User {
  const user = User.load(id.concat(contract).concat(token));
  if (user !== null) {
    return user as User;
  }
  const newUser = new User(id.concat(contract).concat(token));
  newUser.balance = BigInt.zero();
  newUser.token   = token;
  const erc20 = ERC20.bind(token);
  newUser.tokenSymbol = erc20.symbol();
  return newUser;
}

export function getSharePrice(contract: Bytes, token0: Bytes, token0Symbol: string, token1: Bytes, token1Symbol: string): SharePrice {
  const sharePrice = SharePrice.load(contract);
  if (sharePrice !== null) {
    return sharePrice as SharePrice;
  }
  const newSharePrice = new SharePrice(contract);
  newSharePrice.price0 = BigInt.zero();
  newSharePrice.price01 = BigInt.zero();
  newSharePrice.price1 = BigInt.zero();
  newSharePrice.price10 = BigInt.zero();
  newSharePrice.token0 = token0;
  newSharePrice.token0Symbol = token0Symbol;
  newSharePrice.token1 = token1;
  newSharePrice.token1Symbol = token1Symbol;
  return newSharePrice;
}

export function getSharePriceLazy(contract: Bytes, token0: Address, token1: Address): SharePrice {
  const token0Contract = ERC20.bind(token0);
  let token1Symbol = "";
  if (token1 != Address.fromString(ZERO_ADDRESS)) {
    const token1Contract = ERC20.bind(token1);
    token1Symbol = token1Contract.symbol();
  }
  return getSharePrice(contract, token0, token0Contract.symbol(), token1, token1Symbol);
}

export function calcSharePrice(balance: BigInt, shares: BigInt): BigInt {
  return balance.times(BigInt.fromString("1_000_000_000_000_000_000")).div(shares);
}

export function calcBalance(oldBalance: BigInt, shares: BigInt, sharesBurned: BigInt) : BigInt {
  return oldBalance.times(shares).div(shares.plus(sharesBurned));
}

export function getNFT(receiptId: BigInt, contractAddress: Address): NFT {
  const nft = NFT.load(receiptId.toHexString());
  if (nft != null) {
    return nft;
  }
  const nftNew = new NFT(receiptId.toHexString());
  const contract = ReceiptNFT.bind(contractAddress);
  const nftInfo  = contract.try_getReceipt(receiptId);
  if (nftInfo.reverted) {
    nftNew.token = Address.fromString(ZERO_ADDRESS);
    nftNew.tokenAmountUniform = BigInt.zero();
  } else {
    nftNew.token   = nftInfo.value.token;
    nftNew.cycle   = getCycle(nftInfo.value.cycleId).id;
    nftNew.tokenAmountUniform = nftInfo.value.tokenAmountUniform;
  }
  return nftNew;
}

export function getUserSharesForNFT(userId: Bytes) : UserShare {
  return getUserShares(userId, Address.fromString(STRATEGY_ROUTER));
}

export function getCycle(cycleId: BigInt) : Cycle {
  const cycle = Cycle.load(cycleId.toHexString());
  if (cycle != null) {
    return cycle;
  } 
  const newCycle = new Cycle(cycleId.toHexString());
  newCycle.save();
  return newCycle;
}
