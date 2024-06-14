import { BigInt } from "@graphprotocol/graph-ts";
import { ERC20, Transfer as TransferEvent } from "../generated/SharesToken/ERC20";
import { SharesTokenSharesCount } from "../generated/schema";
import { ZERO_ADDRESS, getUserShares } from "./utils";


export function handleTransfer(event: TransferEvent): void {
  const from = event.params.from;
  const to   = event.params.to;
  if (from.toHex() != ZERO_ADDRESS) {
    const userShares = getUserShares(from, event.address);
    userShares.shares0 = userShares.shares0.gt(event.params.value) ? userShares.shares0.minus(event.params.value) : BigInt.zero();
    userShares.save();
  } 
  if (to.toHex() != ZERO_ADDRESS) {
    const userShares = getUserShares(to, event.address);
    userShares.shares0 = userShares.shares0.plus(event.params.value);
    userShares.save();
  }
  //
  let sharesTokenSharesCount = SharesTokenSharesCount.load(event.address);
  if (sharesTokenSharesCount == null) {
    sharesTokenSharesCount = new SharesTokenSharesCount(event.address);
  }
  const contract = ERC20.bind(event.address);
  sharesTokenSharesCount.total = contract.totalSupply();
  sharesTokenSharesCount.save();
}
