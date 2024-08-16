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

const CLIP_TOKEN = Address.fromString("0x4Ea77a86d6E70FfE8Bb947FC86D68a7F086f198a");
const wCLIP_TOKEN = Address.fromString("0x54e4a172dbEaC5B239131a44B71C37113A8530F7");

export function handleStake(event: StakedEvent): void {
  if (event.params.token.equals(wCLIP_TOKEN) || (event.params.token.equals(CLIP_TOKEN))) {
    const userShares = getUserShares(event.params.user, event.address);
    userShares.shares0 = event.params.cumulativeBalance;
    userShares.save();
    const sharePrice = getSharePriceLazy(event.address, CLIP_TOKEN, Address.fromString(ZERO_ADDRESS));
    if (sharePrice.price0.equals(BigInt.zero())) {
      sharePrice.price0 = BigInt.fromString("1000000000000000000");
      sharePrice.save();
    }
  }
}
  
export function handleUnstake(event: UnstakedEvent): void {
  if (event.params.token.equals(wCLIP_TOKEN) || event.params.token.equals(CLIP_TOKEN)) {
    const userShares = getUserShares(event.params.user, event.address);
    userShares.shares0 = event.params.remainingCumulativeBalance;
    userShares.save();
    const sharePrice = getSharePriceLazy(event.address, CLIP_TOKEN, Address.fromString(ZERO_ADDRESS));
    if (sharePrice.price0.equals(BigInt.zero())) {
      sharePrice.price0 = BigInt.fromString("1000000000000000000");
      sharePrice.save();
    }
  }
}


