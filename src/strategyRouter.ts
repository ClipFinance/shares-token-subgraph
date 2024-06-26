import { BigInt } from "@graphprotocol/graph-ts";
import { AllocateToStrategies as AllocateToStrategiesEvent, StrategyRouter } from "../generated/StrategyRouter/StrategyRouter";

import { ZERO_ADDRESS, getCycle, getNFT, getUserShares, getUserSharesForNFT } from "./utils";

export function handleAllocateToStrategies(allocateToStrategies: AllocateToStrategiesEvent): void {
  const cycleId = allocateToStrategies.params.closedCycleId;
  const cycle   = getCycle(cycleId);
  const strategyRouter = StrategyRouter.bind(allocateToStrategies.address);
  const cycleInfo      = strategyRouter.getCycle(cycleId);
  cycle.pricePerShare  = cycleInfo.getPricePerShare();
  cycle.startAt        = cycleInfo.getStartAt();
  cycle.totalDepositedInUsd = cycleInfo.getTotalDepositedInUsd();
  cycle.strategiesBalanceWithCompoundAndBatchDepositsInUsd = cycleInfo.getStrategiesBalanceWithCompoundAndBatchDepositsInUsd();
  cycle.save();
}
