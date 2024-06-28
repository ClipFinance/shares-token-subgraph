import {
  Burned as BurnedEvent,
  Minted as MintedEvent,
  Transfer as TransferEvent,
  HyperLPool
} from "../generated/templates/HyperLPool/HyperLPool";
import { 
  getUserShares, 
  calcSharePrice, 
  getSharePriceLazy, 
  ZERO_ADDRESS, 
  isStakingPool
} from "./utils";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleBurned(event: BurnedEvent): void {
  const pool = HyperLPool.bind(event.address);
  const token0Result = pool.try_token0();
  if (!token0Result.reverted) {
    const token0 = token0Result.value;
    const token1 = pool.token1();
    const sharePrice = getSharePriceLazy(event.address, token0, token1);
    sharePrice.price1 = calcSharePrice(event.params.amount1Out, event.params.burnAmount);
    sharePrice.price10 = calcSharePrice(event.params.amount0Out, event.params.burnAmount);
    sharePrice.save();
  }
}

export function handleMinted(event: MintedEvent): void {
  const pool = HyperLPool.bind(event.address);
  const token0Result = pool.try_token0();
  if (!token0Result.reverted) {
    const token0 = token0Result.value;
    const token1 = pool.token1();
    const sharePrice = getSharePriceLazy(event.address, token0, token1);
    sharePrice.price1 = calcSharePrice(event.params.amount1In, event.params.mintAmount);
    sharePrice.price10 = calcSharePrice(event.params.amount0In, event.params.mintAmount);
    sharePrice.save();
  }
}

export function handleTransfer(event: TransferEvent): void {
  const fromUserShares = getUserShares(event.params.from, event.address);
  const toUserShares   = getUserShares(event.params.to, event.address);
  if (!isStakingPool(event.params.from) && !isStakingPool(event.params.to)) {
    if (event.params.from.toHex() != ZERO_ADDRESS) {
      fromUserShares.shares1 = fromUserShares.shares1.gt(event.params.value) ? fromUserShares.shares1.minus(event.params.value) : BigInt.zero();
      fromUserShares.save()
    }
    if (event.params.to.toHex() != ZERO_ADDRESS) {
      toUserShares.shares1 = toUserShares.shares1.plus(event.params.value);
      toUserShares.save()
    }
  }
}