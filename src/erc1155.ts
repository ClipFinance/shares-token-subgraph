import { Bytes } from "@graphprotocol/graph-ts/common/collections";
import { TransferSingle as TransferSingleEvent} from "../generated/USDTUSDCSwapInside/ERC1155";
import { TransferSingle, User } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

function getUser(id: Bytes, typeId: BigInt, contract: Bytes): User {
  let user = User.load(id.concat(contract).concat(Bytes.fromHexString((typeId.plus(BigInt.fromString("17"))).toHexString())));
  if (user !== null) {
    return user as User;
  }

  const newUser = new User(id.concat(contract).concat(Bytes.fromHexString((typeId.plus(BigInt.fromString("17"))).toHexString())));
  newUser.balance = BigInt.zero();
  newUser.token = contract;
  newUser.typeId = typeId;
  return newUser;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTransferSingle(event: TransferSingleEvent): void {
  const entity = new TransferSingle(event.transaction.hash.concatI32(event.logIndex.toI32()));
  const contract = event.address;
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const typeId = event.params.id;
  const fromUser = getUser(from, typeId, contract);
  const toUser = getUser(to, typeId, contract);
  
  entity.from = from;
  entity.to = to;
  entity.value = value;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.typeId = typeId;

  // Don't subtracts from the ZERO_ADDRESS (it's the one that mint the token)
  if (from.toHex() != ZERO_ADDRESS) {
    fromUser.balance = fromUser.balance.minus(value);
  }
  // Don't add to the ZERO_ADDRESS (it's the one that burns the token)
  if (to.toHex() != ZERO_ADDRESS) {
    toUser.balance = toUser.balance.plus(value);
  }

  entity.save();
  fromUser.save();
  toUser.save();
}
