import { BigInt, Address } from "@graphprotocol/graph-ts";
import { 
  Deposit as DepositEvent, 
  DepositPair as DepositPairEvent, 
  Withdrawn as WithdrawnEvent, 
  WithdrawnNonCompounding as WithdrawnNonCompoundingEvent, 
  WithdrawnPair as WithdrawnPairEvent, 
  WithdrawnAll as WithdrawnAllEvent, 
  PCLBaseSwapInside
} from "../generated/templates/PCLBaseSwapInside/PCLBaseSwapInside";
import {
  Burned as BurnedEvent,
  Minted as MintedEvent
} from "../generated/templates/PHyperPoolSwapInside/PHyperPoolSwapInside";

import { TransferSingle as TransferSingleEvent} from "../generated/templates/PCLBaseSwapInside/ERC1155";
import { getUserShares, calcSharePrice, getSharePriceLazy, ZERO_ADDRESS } from "./utils";
import { MintedBurned } from "../generated/schema";

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
  const token0Result = pclContract.try_token0();
  if (token0Result.reverted) {
    var token0 = pclContract.tokenA();
    var token1 = pclContract.tokenB();
  } else {
    token0 = token0Result.value;
    token1 = pclContract.token1();
  }
  const hyperPoolContract = pclContract.liquidityHypervisor();

  const mintedBurned = getMintedBurned(hyperPoolContract);
  const sharePrice = getSharePriceLazy(event.address, token0, token1);
  if (event.params.compounding) {
    sharePrice.price1 = calcSharePrice(mintedBurned.amount1, mintedBurned.amount);
    sharePrice.price10 = calcSharePrice(mintedBurned.amount0, mintedBurned.amount);
  }  else {
    sharePrice.price0 = calcSharePrice(mintedBurned.amount0, mintedBurned.amount);
    sharePrice.price01 = calcSharePrice(mintedBurned.amount1, mintedBurned.amount);
  }
  sharePrice.save();
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
  const token0Result = pclContract.try_token0();
  if (token0Result.reverted) {
    var token0 = pclContract.tokenA();
    var token1 = pclContract.tokenB();
  } else {
    token0 = token0Result.value;
    token1 = pclContract.token1();
  }
  
  const hyperPoolContract = pclContract.liquidityHypervisor();
  const mintedBurned      = getMintedBurned(hyperPoolContract);
  const sharePrice        = getSharePriceLazy(event.address, token0, token1);
  sharePrice.price1       = calcSharePrice(mintedBurned.amount1, mintedBurned.amount);
  sharePrice.price10      = calcSharePrice(mintedBurned.amount0, mintedBurned.amount);
  sharePrice.save();
}

export function handleWithdrawnNonCompounding(event: WithdrawnNonCompoundingEvent): void {
  const pclContract = PCLBaseSwapInside.bind(event.address);
  const token0Result = pclContract.try_token0();
  if (token0Result.reverted) {
    var token0 = pclContract.tokenA();
    var token1 = pclContract.tokenB();
  } else {
    token0 = token0Result.value;
    token1 = pclContract.token1();
  }
  const hyperPoolContract = pclContract.liquidityHypervisor();

  const mintedBurned = getMintedBurned(hyperPoolContract);
  const sharePrice   = getSharePriceLazy(event.address, token0, token1);
  sharePrice.price0  = calcSharePrice(mintedBurned.amount0, mintedBurned.amount);
  sharePrice.price01 = calcSharePrice(mintedBurned.amount1, mintedBurned.amount);
  sharePrice.save();
}

export function handleWithdrawnPair(event: WithdrawnPairEvent): void {
  const pclContract = PCLBaseSwapInside.bind(event.address);
  const token0Result = pclContract.try_token0();
  if (token0Result.reverted) {
    var tokenA = pclContract.tokenA();
    var tokenB = pclContract.tokenB();
  } else {
    tokenA = token0Result.value;
    tokenB = pclContract.token1();
  }
  const hyperPoolContract = pclContract.liquidityHypervisor();
  const mintedBurned      = getMintedBurned(hyperPoolContract);
  const compound          = event.params.compounding;

  const sharePrice = getSharePriceLazy(event.address, tokenA, tokenB);
  if (compound) {
    sharePrice.price1 = calcSharePrice(mintedBurned.amount1, mintedBurned.amount);
    sharePrice.price10 = calcSharePrice(mintedBurned.amount0, mintedBurned.amount);
  } else {
    sharePrice.price0 = calcSharePrice(mintedBurned.amount0, mintedBurned.amount);
    sharePrice.price01 = calcSharePrice(mintedBurned.amount1, mintedBurned.amount);
  }
  sharePrice.save();
}

export function handleWithdrawnAll(event: WithdrawnAllEvent): void {
  const contract = event.address;
  const withdrawer = event.params.withdrawer;

  const userShares = getUserShares(withdrawer, contract);
  
  userShares.shares0 = BigInt.zero();
  userShares.shares1 = BigInt.zero();
  userShares.save();
}

function getMintedBurned(contract: Address): MintedBurned {
  const mintedBurned = MintedBurned.load(contract);
  if (mintedBurned !== null) {
    return mintedBurned;
  } 
  const newMintedBurned = new MintedBurned(contract);
  newMintedBurned.amount = BigInt.zero();
  newMintedBurned.amount0 = BigInt.zero();
  newMintedBurned.amount1 = BigInt.zero();
  return newMintedBurned
}


export function handleBurned(event: BurnedEvent): void {
  const mintedBurned = getMintedBurned(event.address);
  mintedBurned.amount = event.params.burnAmount;
  mintedBurned.amount0 = event.params.amount0Out;
  mintedBurned.amount1 = event.params.amount1Out;
  mintedBurned.save();
}

export function handleMinted(event: MintedEvent): void {
  const mintedBurned = getMintedBurned(event.address);
  mintedBurned.amount = event.params.mintAmount;
  mintedBurned.amount0 = event.params.amount0In;
  mintedBurned.amount1 = event.params.amount1In;
  mintedBurned.save();
}