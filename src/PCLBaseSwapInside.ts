import { BigInt } from "@graphprotocol/graph-ts";
import { 
  Deposit as DepositEvent, 
  DepositPair as DepositPairEvent, 
  Withdrawn as WithdrawnEvent, 
  WithdrawnNonCompounding as WithdrawnNonCompoundingEvent, 
  WithdrawnPair as WithdrawnPairEvent, 
  WithdrawnAll as WithdrawnAllEvent, 
  PCLBaseSwapInside
} from "../generated/templates/PCLBaseSwapInside/PCLBaseSwapInside";

import { TransferSingle as TransferSingleEvent} from "../generated/templates/PCLBaseSwapInside/ERC1155";
import { getUserShares, getUser, calcBalance, getSharePrice, calcSharePrice } from "./utils";


const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
      fromUserShares.shares0 = fromUserShares.shares0.gt(value) ? fromUserShares.shares0.minus(value) : BigInt.zero();
    } else {
      fromUserShares.shares1 = fromUserShares.shares1.gt(value) ? fromUserShares.shares1.minus(value) : BigInt.zero();
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

function doDeposit(event: DepositEvent): void {
  const pclContract = PCLBaseSwapInside.bind(event.address);
  const tokenA = pclContract.token0();
  const tokenB = pclContract.token1();
  const contract = event.address;
  const depositor = event.params.depositor;
  const amountA   = event.params.amountA;
  const amountB   = event.params.amountB;

  const userA = getUser(depositor, contract, tokenA);
  const userB = getUser(depositor, contract, tokenB);
  
  userA.balance = userA.balance.plus(amountA);
  userB.balance = userB.balance.plus(amountB);

  userA.save();
  userB.save();
}

export function handleDeposit(event: DepositEvent): void {
  doDeposit(event);
}

export function handleDepositPair(event: DepositPairEvent): void {
  doDeposit(new DepositEvent(event.address, event.logIndex, event.transactionLogIndex, event.logType, event.block, 
    event.transaction, event.parameters, event.receipt));
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  const pclContract = PCLBaseSwapInside.bind(event.address);
  const tokenA = pclContract.token0();
  const tokenB = pclContract.token1();
  const contract = event.address;
  const withdrawer = event.params.withdrawer;
  let sharesBurned    = event.params.sharesBurned;
  
  const userA = getUser(withdrawer, contract, tokenA);
  const userB = getUser(withdrawer, contract, tokenB);
  const userShares = getUserShares(withdrawer, contract);
  if (userShares.shares1.plus(sharesBurned) !== BigInt.zero()) {
    sharesBurned = sharesBurned
      .times(pclContract.compoundShareRate())
      .div(BigInt.fromString("1_000_000_000_000_000_000"));
    userA.balance = calcBalance(userA.balance, userShares.shares1, sharesBurned);
    userB.balance = calcBalance(userB.balance, userShares.shares1, sharesBurned);
    userA.save();
    userB.save();
  }
}

export function handleWithdrawnNonCompounding(event: WithdrawnNonCompoundingEvent): void {
  const pclContract = PCLBaseSwapInside.bind(event.address);
  const tokenA = pclContract.token0();
  const tokenB = pclContract.token1();
  const contract = event.address;
  const withdrawer = event.params.withdrawer;
  const sharesBurned = event.params.sharesBurned;
  
  const userA = getUser(withdrawer, contract, tokenA);
  const userB = getUser(withdrawer, contract, tokenB);
  const userShares = getUserShares(withdrawer, contract);
  if (userShares.shares0.plus(sharesBurned) !== BigInt.zero()) {
    userA.balance = calcBalance(userA.balance, userShares.shares0, sharesBurned);
    userB.balance = calcBalance(userB.balance, userShares.shares0, sharesBurned);
    userA.save();
    userB.save();
  }
}

export function handleWithdrawnPair(event: WithdrawnPairEvent): void {
  const pclContract = PCLBaseSwapInside.bind(event.address);
  const tokenA = pclContract.token0();
  const tokenB = pclContract.token1();
  const contract = event.address;
  const withdrawer = event.params.withdrawer;
  const amountAWithdrawn = event.params.amountAWithdrawn;
  const amountBWithdrawn = event.params.amountBWithdrawn;
  let sharesBurned     = event.params.burnAmount;
  const compound         = event.params.compounding;

  const userA = getUser(withdrawer, contract, tokenA);
  const userB = getUser(withdrawer, contract, tokenB);
  const userShares = getUserShares(withdrawer, contract);
  if (compound) {
    sharesBurned = sharesBurned
      .times(pclContract.compoundShareRate())  
      .div(BigInt.fromString("1_000_000_000_000_000_000"));
      
    userA.balance = calcBalance(userA.balance, userShares.shares1, sharesBurned);
    userB.balance = calcBalance(userB.balance, userShares.shares1, sharesBurned);
  } else {
    userA.balance = calcBalance(userA.balance, userShares.shares0, sharesBurned);
    userB.balance = calcBalance(userB.balance, userShares.shares0, sharesBurned);
  }
  if (sharesBurned !== BigInt.zero()) {
    const sharePrice = getSharePrice(contract);
    if (compound) {
      sharePrice.price1 = calcSharePrice(amountAWithdrawn.equals(BigInt.zero()) ? amountBWithdrawn : amountAWithdrawn, sharesBurned);
    } else {
      sharePrice.price0 = calcSharePrice(amountAWithdrawn.equals(BigInt.zero()) ? amountBWithdrawn : amountAWithdrawn, sharesBurned);
    }
    sharePrice.save();
  }
  userA.save();
  userB.save();
}

export function handleWithdrawnAll(event: WithdrawnAllEvent): void {
  const pclContract = PCLBaseSwapInside.bind(event.address);
  const tokenA = pclContract.token0();
  const tokenB = pclContract.token1();
  const contract = event.address;
  const withdrawer = event.params.withdrawer;

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