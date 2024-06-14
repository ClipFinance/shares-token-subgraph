import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent, MendiVault } from "../generated/templates/MendiVault/MendiVault";
import { Compound as ComoundEvent, MendiLeverage } from "../generated/templates/Mendi/MendiLeverage"
import { getUser, getSharePrice, getUserShares, getSharePriceLazy, ZERO_ADDRESS } from "./utils";


export function handleTransfer(event: TransferEvent): void {
  const from = event.params.from;
  const to   = event.params.to;
  if ((from.toHex() != ZERO_ADDRESS) && (to.toHex() == ZERO_ADDRESS)) {
    const mendiVault = MendiVault.bind(event.address);
    const depositToken = mendiVault.depositToken();
    const userShares = getUserShares(from, event.address);
    userShares.shares0 = mendiVault.balanceOf(from);
    userShares.save();
    const user = getUser(from, event.address, depositToken);
    const sharePrice = getSharePrice(event.address, depositToken, user.tokenSymbol, Bytes.fromHexString("0x00"), "");
    sharePrice.price0 = mendiVault.getPricePerFullShare();
    sharePrice.save();
    user.balance = sharePrice.price0.times(userShares.shares0).div(BigInt.fromString("1_000_000_000_000_000_000"));
    user.save();
  } else if ((to.toHex() != ZERO_ADDRESS) && (from.toHex() == ZERO_ADDRESS)) {
    const mendiVault = MendiVault.bind(event.address);
    const depositToken = mendiVault.depositToken();
    const user = getUser(to, event.address, depositToken);
    const userShares = getUserShares(to, event.address);
    userShares.shares0 = mendiVault.balanceOf(to);
    userShares.save();
    const sharePrice = getSharePrice(event.address, depositToken, user.tokenSymbol, Bytes.fromHexString("0x00"), "");
    sharePrice.price0 = mendiVault.getPricePerFullShare();
    sharePrice.save();
    user.balance = sharePrice.price0.times(userShares.shares0).div(BigInt.fromString("1_000_000_000_000_000_000"));
    user.save();
  }
}

export function handleCompound(event: ComoundEvent): void {
  const mendiLeverage = MendiLeverage.bind(event.address);
  const depositToken  = mendiLeverage.depositToken();
  const vault         = mendiLeverage.vault();
  const sharePrice    = getSharePriceLazy(vault, depositToken, Address.fromString(ZERO_ADDRESS));
  const vaultContract = MendiVault.bind(vault);
  sharePrice.price0   = vaultContract.getPricePerFullShare();  
  sharePrice.save();  
}
