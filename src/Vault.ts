import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent, Vault } from "../generated/templates/Vault/Vault";
import { Compound as ComoundEvent, Leverage } from "../generated/templates/Leverage/Leverage";
import { getUser, getSharePrice, getUserShares, getSharePriceLazy, ZERO_ADDRESS } from "./utils";


export function handleTransfer(event: TransferEvent): void {
  const from = event.params.from;
  const to   = event.params.to;
  if ((from.toHex() != ZERO_ADDRESS) && (to.toHex() == ZERO_ADDRESS)) {
    const vault = Vault.bind(event.address);
    const depositToken = vault.depositToken();
    const userShares = getUserShares(from, event.address);
    userShares.shares0 = vault.balanceOf(from);
    userShares.save();
    const user = getUser(from, event.address, depositToken);
    const sharePrice = getSharePrice(event.address, depositToken, user.tokenSymbol, Bytes.fromHexString("0x00"), "");
    sharePrice.price0 = vault.getPricePerFullShare();
    sharePrice.save();
    user.balance = sharePrice.price0.times(userShares.shares0).div(BigInt.fromString("1_000_000_000_000_000_000"));
    user.save();
  } else if ((to.toHex() != ZERO_ADDRESS) && (from.toHex() == ZERO_ADDRESS)) {
    const vault = Vault.bind(event.address);
    const depositToken = vault.depositToken();
    const user = getUser(to, event.address, depositToken);
    const userShares = getUserShares(to, event.address);
    userShares.shares0 = vault.balanceOf(to);
    userShares.save();
    const sharePrice = getSharePrice(event.address, depositToken, user.tokenSymbol, Bytes.fromHexString("0x00"), "");
    sharePrice.price0 = vault.getPricePerFullShare();
    sharePrice.save();
    user.balance = sharePrice.price0.times(userShares.shares0).div(BigInt.fromString("1_000_000_000_000_000_000"));
    user.save();
  }
}

export function handleCompound(event: ComoundEvent): void {
  const leverage = Leverage.bind(event.address);
  const depositToken  = leverage.depositToken();
  const vault         = leverage.vault();
  const sharePrice    = getSharePriceLazy(vault, depositToken, Address.fromString(ZERO_ADDRESS));
  const vaultContract = Vault.bind(vault);
  sharePrice.price0   = vaultContract.getPricePerFullShare();  
  sharePrice.save();  
}
