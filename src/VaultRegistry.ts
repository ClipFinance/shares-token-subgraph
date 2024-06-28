import { Address, } from "@graphprotocol/graph-ts";
import { VaultAdded} from "../generated/VaultRegistry/VaultRegistry";
import { 
    Vault, 
    PCLBaseSwapInside, 
    Leverage, 
    PHyperPoolSwapInside,
    HyperLPool
  } from "../generated/templates";
import { Registry } from "../generated/VaultRegistry/Registry";
import { Vault as VaultContract } from "../generated/templates/Vault/Vault";
import { PHyperPoolSwapInside as PHyperPoolSwapInsideContact } from "../generated/templates/PHyperPoolSwapInside/PHyperPoolSwapInside";
import { StakingPool, StrategyVault } from "../generated/schema";
import { createStrategyVault } from "./utils";

const REGISTRY_ADDRESS: Address = Address.fromString('0x02eA2e205695D31E0308FdC844Cbb2d41bf20275');

export function handleVaultAdded(event: VaultAdded): void {
  const strategyTypeId = event.params.data.at(31); 
  const key            = event.params.vault;
  if (strategyTypeId == 1) {
    if (key.equals(Address.fromHexString("0x5988f6f5c2dc462a23e376017c905fa0c3d91c84"))) {
      //do this, because these contracts were added without needed information into VaultRegistry
      PCLBaseSwapInside.create(Address.fromString("0x94858183646c0622D424F06f506D0faef6c915CD"));
      PHyperPoolSwapInside.create(key);
    } else if (key.equals(Address.fromHexString("0x5757a514aef25ff8909614489766053400f5de86"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0x45389eb17c65d4f253CAc9FadE1F397D8874a7CA"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0x7381218088362C8D23b91b953C43700C6cCcfc25"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0xe0d7F1F725f475e9Dd5AD91Fb3eD41aF75aF0D26"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0xe00eF633CaB32EfeCEE123214F361c2F8c6FBF33"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0x49F17F640be36E546233b52C1e8E3C06b7962f1D"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0xeC45B2706e2a1Fb38bA935f55D6F236FF0f85D79"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0xAf2f7B724F8FEc41AC7E4F9411464c5c78de3Fa8"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } 
    //bsc
    else if (key.equals(Address.fromHexString("0xEEea7dD3c998aFd9f298C041E4AA8A3c41b02A6C"))) {
      //skip to create PCLBaseSwapInside, because presented directly in the manifest
    } 
    //base
    else if (key.equals(Address.fromHexString("0xcd84d057f888A8827E63eC8C77E3F686575B84E7"))) {
      //skip to create PCLBaseSwapInsied, because presented directly in the manifest
    } else {
      if (event.params.data.toHex().length > 155) {
        PCLBaseSwapInside.create(Address.fromString(event.params.data.toHex().substring(154)));
        PHyperPoolSwapInside.create(key);
      } else {
        PHyperPoolSwapInside.create(key);
        const pHyperPool = PHyperPoolSwapInsideContact.bind(key);
        const registry = Registry.bind(REGISTRY_ADDRESS);
        PCLBaseSwapInside.create(registry.getAddressByIdentifier(pHyperPool.getIdentifiers().value2));
      }
    }
  } else if ((strategyTypeId == 3) || (strategyTypeId == 7)) {
    if (key.equals(Address.fromString("0xF37d1F5DC65fe553745c79459004E94Af9F61Ff3"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0xF37d1F5DC65fe553745c79459004E94Af9F61Ff3"), 
        Address.fromString("0x17bcC8D209bf7859Ec711a3D719EE58878b48Df4"));
      Leverage.create(Address.fromString("0x17bcC8D209bf7859Ec711a3D719EE58878b48Df4"));
    } else if (key.equals(Address.fromString("0xb79F535a1aad915348eA278E54C37be6C568e93c"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0xb79F535a1aad915348eA278E54C37be6C568e93c"),
        Address.fromString("0xb79F535a1aad915348eA278E54C37be6C568e93c"));
      Leverage.create(Address.fromString("0xb79F535a1aad915348eA278E54C37be6C568e93c"));
    } else if (key.equals(Address.fromString("0x0C3897769D57EF1f0721ff291C766709a02991DE"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0x0C3897769D57EF1f0721ff291C766709a02991DE"), 
        Address.fromString("0x923f68FBe15cbd88C91e5486f7dd57b01E3f0819"));
      Leverage.create(Address.fromString("0x923f68FBe15cbd88C91e5486f7dd57b01E3f0819"));
    } else if (key.equals(Address.fromString("0xB99196cbe4e2B85d0e8597A3f25967Bf303D6388"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0xB99196cbe4e2B85d0e8597A3f25967Bf303D6388"), 
        Address.fromString("0x117Dc83377Af724377189BC8fC0Cb0d551B9AFA0"));
      Leverage.create(Address.fromString("0x117Dc83377Af724377189BC8fC0Cb0d551B9AFA0"));
    } else if (key.equals(Address.fromString("0x464eEfB9253d9E3bF6ED370F3DD4b222b86fAFf7"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0x464eEfB9253d9E3bF6ED370F3DD4b222b86fAFf7"),
        Address.fromString("0x27CC2b93E638c8c69a7627424Ea588278A5B20CE"));
      Leverage.create(Address.fromString("0x27CC2b93E638c8c69a7627424Ea588278A5B20CE"));
    } else if (key.equals(Address.fromString("0x9EbB90358d60e36688baD15B8a914E074b1A1C9b"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0x9EbB90358d60e36688baD15B8a914E074b1A1C9b"), 
        Address.fromString("0x02AE7F634B3AD19284Dc94B92ECe46b42651bc21"));
      Leverage.create(Address.fromString("0x02AE7F634B3AD19284Dc94B92ECe46b42651bc21"));
    } else if (key.equals(Address.fromString("0xB00Ad70C6A0d58372199AbEB33F46058d02FFBBC"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0xB00Ad70C6A0d58372199AbEB33F46058d02FFBBC"),
        Address.fromString("0x55F52b8466482c57DD6B6f37A1eCdf23EAd072D5"));
      Leverage.create(Address.fromString("0x55F52b8466482c57DD6B6f37A1eCdf23EAd072D5"));
    } else if (key.equals(Address.fromString("0x2528c7B8c7c0d6Ab4461BbAa14F5905Ea93ad837"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0x2528c7B8c7c0d6Ab4461BbAa14F5905Ea93ad837"), 
        Address.fromString("0xD4E55DB32918af1B25Da0b716d023ac9AD0060F2"));
      Leverage.create(Address.fromString("0xD4E55DB32918af1B25Da0b716d023ac9AD0060F2"));
    } else if (key.equals(Address.fromString("0xfdC83eC519A4E24edC88E5bD57298edd5451651f"))) {    
      //skip to create MendiVault, because presented directly in the manifest
      createStrategyVault(Address.fromString("0xfdC83eC519A4E24edC88E5bD57298edd5451651f"),
        Address.fromString("0xfdC83eC519A4E24edC88E5bD57298edd5451651f"));
      Leverage.create(Address.fromString("0xfdC83eC519A4E24edC88E5bD57298edd5451651f"));
    } else if (key.equals(Address.fromString("0xe3638a0B74b5A5C4a220163A05EB6b334e8a165d"))) {    
      //skip, because presented directly in the manifest
      createStrategyVault(Address.fromString("0xe3638a0B74b5A5C4a220163A05EB6b334e8a165d"), 
        Address.fromString("0x114d7566606bE9bb92BBDc902bfb28dAA22a6096"));
      Leverage.create(Address.fromString("0x114d7566606bE9bb92BBDc902bfb28dAA22a6096"));
    } else {
      Vault.create(key);
      const vault = VaultContract.bind(key);
      const leverage = vault.strategy();
      createStrategyVault(key, leverage);
      Leverage.create(leverage);
    }
  } else if (strategyTypeId == 5) { //LynexAlgebra
    HyperLPool.create(key);
  } else if (strategyTypeId == 6) { //Nile
    if (key.equals(Address.fromString("0x03e9d9892475445ea0Ad323C5B9f369fD3c904de"))) {
      //skip, because presented directly in the manifest
    } else if (key.equals(Address.fromString("0x568FA0D489A75eb88d75cB688D1FC4fCecC628b7"))) {
      //skip, because presented directly in the manifest
    } else {
      if (event.params.data.toHex().length > 155) {
        const stakingPool = new StakingPool(Address.fromString(event.params.data.toHex().substring(154)));
        stakingPool.save();
      }
      HyperLPool.create(key) 
    }
  }
}
