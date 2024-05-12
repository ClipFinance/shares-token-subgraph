import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent, Mendi } from "../generated/templates/Mendi/Mendi";
import { getUser, getSharePrice, getUserShares } from "./utils";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: TransferEvent): void {
  const from = event.params.from;
  const to   = event.params.to;
  let needToDoSomething = false;
  const mendi = Mendi.bind(event.address);
  if ((from.toHex() != ZERO_ADDRESS) && (to.toHex() == ZERO_ADDRESS)) {
    needToDoSomething = true;
    const depositToken = mendi.depositToken();
    const user = getUser(from, event.address, depositToken);
    user.balance = user.balance.gt(event.params.value) ? user.balance.minus(event.params.value) : BigInt.zero();
    user.save();
    const userShares = getUserShares(from, event.address);
    userShares.shares0 = mendi.balanceOf(from);
    userShares.save();
  } else if ((to.toHex() != ZERO_ADDRESS) && (from.toHex() == ZERO_ADDRESS)) {
    needToDoSomething = true;
    const depositToken = mendi.depositToken();
    const user = getUser(to, event.address, depositToken);
    user.balance = user.balance.plus(event.params.value);
    user.save();
    const userShares = getUserShares(to, event.address);
    userShares.shares0 = mendi.balanceOf(to);
    userShares.save();
  }

  if (needToDoSomething) {
    const sharePrice = getSharePrice(event.address);
    sharePrice.price0 = mendi.getPricePerFullShare();
    sharePrice.save();
  }
}