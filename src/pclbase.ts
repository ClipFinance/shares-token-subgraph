import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Deposit, DepositPair, Withdrawn, WithdrawnNonCompounding, WithdrawnPair, WithdrawnAll, PCLBase } from "../generated/USDCeWETH500SwapInside/PCLBase";
import { TransferSingle as TransferSingleEvent} from "../generated/USDTUSDCSwapInside/ERC1155";
import {  SharePrice, User, UserShares } from "../generated/schema";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function getUserShares(id: Bytes, contract: Bytes): UserShares {
  const userShares = UserShares.load(id.concat(contract));
  if (userShares !== null) {
    return userShares as UserShares;
  }

  const newUserShares = new UserShares(id.concat(contract));
  newUserShares.shares0 = BigInt.zero();
  newUserShares.shares1 = BigInt.zero();
  return newUserShares;
}

function getUser(id: Bytes, contract: Bytes, token: Bytes): User {
  const user = User.load(id.concat(contract).concat(token));
  if (user !== null) {
    return user as User;
  }
  const newUser = new User(id.concat(contract).concat(token));
  newUser.balance = BigInt.zero();
  newUser.token   = token;
  return newUser;
}

function getSharePrice(contract: Bytes): SharePrice {
  const sharePrice = SharePrice.load(contract);
  if (sharePrice !== null) {
    return sharePrice as SharePrice;
  }
  const newSharePrice = new SharePrice(contract);
  newSharePrice.price0 = BigInt.zero();
  newSharePrice.price1 = BigInt.zero();
  return newSharePrice;
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  const contract = event.address;
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const typeId = event.params.id;
  const fromUserShares = getUserShares(from, contract);
  const toUserShares = getUserShares(to, contract);
  
  // Don't subtracts from the ZERO_ADDRESS (it's the one that mint the token)
  if (from.toHex() != ZERO_ADDRESS) {
    if (typeId.equals(BigInt.zero())) {
      fromUserShares.shares0 = fromUserShares.shares0.minus(value);
    } else {
      fromUserShares.shares1 = fromUserShares.shares1.minus(value);
    }
    fromUserShares.save();
  }
  // Don't add to the ZERO_ADDRESS (it's the one that burns the token)
  if (to.toHex() != ZERO_ADDRESS) {
    if (typeId.equals(BigInt.zero())) {
      toUserShares.shares0 = toUserShares.shares0.plus(value);
    } else {
      toUserShares.shares1 = toUserShares.shares1.plus(value);
    }
    toUserShares.save();
  }
}

function doDeposit(event: Deposit) {
  const pclContract = PCLBase.bind(event.address);
  const tokenA = pclContract.tokenA() as Bytes;
  const tokenB = pclContract.tokenB() as Bytes;
  const contract = event.address;
  const depositor = event.params.depositor;
  const amountA   = event.params.amountA;
  const amountB   = event.params.amountB;
  const compound  = event.params.compounding;

  const userA = getUser(depositor, contract, tokenA);
  const userB = getUser(depositor, contract, tokenB);
  
  userA.balance = userA.balance.plus(amountA);
  userB.balance = userB.balance.plus(amountB);

  const sharePrice = getSharePrice(contract);
  const userShares = getUserShares(depositor, contract);

  if (userShares.shares0.notEqual(BigInt.zero()) && !compound) {
    sharePrice.price0 = userA.balance.div(userShares.shares0); 
  }
  if (userShares.shares1.notEqual(BigInt.zero()) && compound) {
    sharePrice.price1 = userB.balance.div(userShares.shares1);
  }
  userA.save();
  userB.save();
  sharePrice.save();
}

export function handleDeposit(event: Deposit): void {
  doDeposit(event);
}

export function handleDepositPair(event: DepositPair): void {
  doDeposit(event as Deposit);
}

export function handleWithdrawn(event: Withdrawn): void {
  const pclContract = PCLBase.bind(event.address);
  const tokenA = pclContract.tokenA() as Bytes;
  const tokenB = pclContract.tokenB() as Bytes;
  const contract = event.address;
  const withdrawer = event.params.withdrawer;
  const amountWithdrawn = event.params.amountWithdrawn;
  const sharesBurned    = event.params.sharesBurned;
  
  const userA = getUser(withdrawer, contract, tokenA);
  const userB = getUser(withdrawer, contract, tokenB);
  const userShares = getUserShares(withdrawer, contract);
  if (userShares.shares1.plus(sharesBurned) !== BigInt.zero()) {
    userA.balance = userA.balance.times(userShares.shares1).div(userShares.shares1.plus(sharesBurned));
    userB.balance = userB.balance.times(userShares.shares1).div(userShares.shares1.plus(sharesBurned));
    const sharePrice = getSharePrice(contract);
    if (sharesBurned !== BigInt.zero()) {
      sharePrice.price1 = amountWithdrawn.div(sharesBurned);
      sharePrice.save();
    }
    userA.save();
    userB.save();
  }
}

export function handleWithdrawnNonCompounding(event: WithdrawnNonCompounding): void {
  const pclContract = PCLBase.bind(event.address);
  const tokenA = pclContract.tokenA() as Bytes;
  const tokenB = pclContract.tokenB() as Bytes;
  const contract = event.address;
  const withdrawer = event.params.withdrawer;
  const amountWithdrawn = event.params.amountWithdrawn;
  const sharesBurned    = event.params.sharesBurned;
  
  const userA = getUser(withdrawer, contract, tokenA);
  const userB = getUser(withdrawer, contract, tokenB);
  const userShares = getUserShares(withdrawer, contract);
  if (userShares.shares0.plus(sharesBurned) !== BigInt.zero()) {
    userA.balance = userA.balance.times(userShares.shares0).div(userShares.shares0.plus(sharesBurned));
    userB.balance = userB.balance.times(userShares.shares0).div(userShares.shares0.plus(sharesBurned));
    if (sharesBurned !== BigInt.zero()) {
      const sharePrice = getSharePrice(contract);
      sharePrice.price0 = amountWithdrawn.div(sharesBurned);
      sharePrice.save();
    }
    userA.save();
    userB.save();
  }
}

export function handleWithdrawnPair(event: WithdrawnPair): void {
  const pclContract = PCLBase.bind(event.address);
  const tokenA = pclContract.tokenA() as Bytes;
  const tokenB = pclContract.tokenB() as Bytes;
  const contract = event.address;
  const withdrawer = event.params.withdrawer;
  const amountAWithdrawn = event.params.amountAWithdrawn;
  const amountBWithdrawn = event.params.amountBWithdrawn;
  const sharesBurned     = event.params.burnAmount;
  const compound         = event.params.compounding;

  const userA = getUser(withdrawer, contract, tokenA);
  const userB = getUser(withdrawer, contract, tokenB);
  const userShares = getUserShares(withdrawer, contract);
  
  if (compound) {
    userA.balance = userA.balance.times(userShares.shares1).div(userShares.shares1.plus(sharesBurned));
    userB.balance = userB.balance.times(userShares.shares1).div(userShares.shares1.plus(sharesBurned));
  } else {
    userA.balance = userA.balance.times(userShares.shares0).div(userShares.shares0.plus(sharesBurned));
    userB.balance = userB.balance.times(userShares.shares0).div(userShares.shares0.plus(sharesBurned));
  }
  if (sharesBurned !== BigInt.zero()) {
    const sharePrice = getSharePrice(contract);
    if (compound) {
      sharePrice.price1 = amountAWithdrawn.div(sharesBurned);
    } else {
      sharePrice.price0 = amountAWithdrawn.div(sharesBurned);
    }
    sharePrice.save();
  }
  userA.save();
  userB.save();
}

export function handleWithdrawnAll(event: WithdrawnAll): void {
  const pclContract = PCLBase.bind(event.address);
  const tokenA = pclContract.tokenA() as Bytes;
  const tokenB = pclContract.tokenB() as Bytes;
  const contract = event.address;
  const withdrawer = event.params.withdrawer;
  const amountWithdrawn = event.params.amountWithdrawn;
  const sharesBurned    = event.params.sharesBurned;

  const userA = getUser(withdrawer, contract, tokenA);
  const userB = getUser(withdrawer, contract, tokenB);
  const userShares = getUserShares(withdrawer, contract);
  
  userShares.shares0 = BigInt.zero();
  userShares.shares1 = BigInt.zero();
  userShares.save();

  userA.balance = BigInt.zero();
  userB.balance = BigInt.zero();
  
  userA.save();
  userB.save();
}