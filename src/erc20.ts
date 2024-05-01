import { BigInt, BigDecimal, Bytes, log, Address } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../generated/ERC20/ERC20";
import { Transfer, User } from "../generated/schema";

function getUser(id: Bytes, token: Bytes): User {
  let user = User.load(id.concat(token));
  if (user !== null) {
    return user as User;
  }

  const newUser = new User(id);
  newUser.balance = BigInt.zero();
  newUser.token = token;
  return newUser;

}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: TransferEvent): void {
  const entity = new Transfer(event.transaction.hash.concatI32(event.logIndex.toI32()));
  const token = event.address;
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const fromUser = getUser(from, token);
  const toUser = getUser(to, token);

  entity.from = from;
  entity.to = to;
  entity.value = value;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

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
