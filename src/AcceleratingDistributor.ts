import {
  Stake as StakedEvent,
  Unstake as UnstakedEvent,
} from "../generated/AcceleratingDistributor/AcceleratingDistributor";
import { 
  getUserShares, 
  getSharePriceLazy, 
  ZERO_ADDRESS, 
} from "./utils";
import { Address, BigInt } from "@graphprotocol/graph-ts";

const CLIP_TOKEN = Address.fromString("0x4ea77a86d6e70ffe8bb947fc86d68a7f086f198");

export function handleStake(event: StakedEvent): void {
  if (event.params.token.equals(CLIP_TOKEN)) {
    const userShares = getUserShares(event.params.user, event.address);
    userShares.shares1 = event.params.cumulativeBalance;
    userShares.save();
    const sharePrice = getSharePriceLazy(event.address, event.params.token, Address.fromString(ZERO_ADDRESS));
    if (sharePrice.price1.equals(BigInt.zero())) {
      sharePrice.price1 = BigInt.fromString("1");
      sharePrice.save();
    }
  }
}
  
export function handleUnstake(event: UnstakedEvent): void {
  if (event.params.token.equals(CLIP_TOKEN)) {
    const userShares = getUserShares(event.params.user, event.address);
    userShares.shares1 = event.params.remainingCumulativeBalance;
    userShares.save();
    const sharePrice = getSharePriceLazy(event.address, event.params.token, Address.fromString(ZERO_ADDRESS));
    if (sharePrice.price1.equals(BigInt.zero())) {
      sharePrice.price1 = BigInt.fromString("1");
      sharePrice.save();
    }
  }
}


