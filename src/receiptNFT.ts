import { Transfer as TransferEvent } from "../generated/ReceiptNFT/ReceiptNFT";
import { ZERO_ADDRESS, getNFT, getUserSharesForNFT } from "./utils";

export function handleTransferNFT(event: TransferEvent): void {
  const tokenId = event.params.tokenId;
  const nft     = getNFT(tokenId, event.address);
  if (event.params.to.toHex() != ZERO_ADDRESS) {
    nft.userShare = getUserSharesForNFT(event.params.to).id;
  } else if (nft.userShare) {
    nft.userShare = null;
  }
  if (nft.token) {
     nft.save();
  }
}