import { BigInt } from "@graphprotocol/graph-ts";
import { ReceiptNFT, Transfer as TransferEvent } from "../generated/ReceiptNFT/ReceiptNFT";
import { NFT, SharesTokenSharesCount, UserShare } from "../generated/schema";
import { ZERO_ADDRESS, getNFT, getUserShares, getUserSharesForNFT } from "./utils";

export function handleTransferNFT(event: TransferEvent): void {
  const tokenId = event.params.tokenId;
  const nft     = getNFT(tokenId, event.address);
  if (event.params.to.toHex() != ZERO_ADDRESS) {
    nft.userShare = getUserSharesForNFT(event.params.to).id;
    nft.save();
  } else if (nft.userShare) {
    nft.userShare = null;
  }
}