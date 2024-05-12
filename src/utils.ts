import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {  SharePrice, User, UserShare } from "../generated/schema";
import { ERC20 } from "../generated/templates/PCLBaseSwapInside/ERC20";

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

export function getSharePrice(contract: Bytes): SharePrice {
  const sharePrice = SharePrice.load(contract);
  if (sharePrice !== null) {
    return sharePrice as SharePrice;
  }
  const newSharePrice = new SharePrice(contract);
  newSharePrice.price0 = BigInt.zero();
  newSharePrice.price1 = BigInt.zero();
  return newSharePrice;
}

export function calcSharePrice(balance: BigInt, shares: BigInt): BigInt {
  return balance.times(BigInt.fromString("1_000_000_000_000_000_000")).div(shares);
}

export function calcBalance(oldBalance: BigInt, shares: BigInt, sharesBurned: BigInt) : BigInt {
  return oldBalance.times(shares).div(shares.plus(sharesBurned));
}