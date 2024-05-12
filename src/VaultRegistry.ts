import { Address, BigInt, Bytes,  } from "@graphprotocol/graph-ts";
import { 
  VaultAdded,
} from "../generated/VaultRegistry/VaultRegistry";
import { Mendi, PCLBaseSwapInside } from "../generated/templates";
import { getUser } from "./utils";

export function handleVaultAdded(event: VaultAdded): void {
  if (event.params.data.at(31) == 1) {
    const key  = event.params.vault;
    if (key.equals(Address.fromHexString("0x5988f6f5c2dc462a23e376017c905fa0c3d91c84"))) {
      PCLBaseSwapInside.create(Address.fromString("0x94858183646c0622D424F06f506D0faef6c915CD"));
    } else if (key.equals(Address.fromHexString("0x5757a514aef25ff8909614489766053400f5de86"))) {
      //skip, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0x45389eb17c65d4f253CAc9FadE1F397D8874a7CA"))) {
      //skip, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0x7381218088362C8D23b91b953C43700C6cCcfc25"))) {
      //skip, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0xe0d7F1F725f475e9Dd5AD91Fb3eD41aF75aF0D26"))) {
      //skip, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0xe00eF633CaB32EfeCEE123214F361c2F8c6FBF33"))) {
      //skip, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0x49F17F640be36E546233b52C1e8E3C06b7962f1D"))) {
      //skip, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0xeC45B2706e2a1Fb38bA935f55D6F236FF0f85D79"))) {
      //skip, because presented directly in the manifest
    } else if (key.equals(Address.fromHexString("0xAf2f7B724F8FEc41AC7E4F9411464c5c78de3Fa8"))) {
      //skip, because presented directly in the manifest
    } else {
      PCLBaseSwapInside.create(Address.fromString(event.params.data.toHex().substring(90)));
    }
  } else if (event.params.data.at(31) == 3) {
    if (event.params.vault.equals(Address.fromString("0xF37d1F5DC65fe553745c79459004E94Af9F61Ff3"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0xb79F535a1aad915348eA278E54C37be6C568e93c"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0x0C3897769D57EF1f0721ff291C766709a02991DE"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0xB99196cbe4e2B85d0e8597A3f25967Bf303D6388"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0x464eEfB9253d9E3bF6ED370F3DD4b222b86fAFf7"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0x9EbB90358d60e36688baD15B8a914E074b1A1C9b"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0xB00Ad70C6A0d58372199AbEB33F46058d02FFBBC"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0x2528c7B8c7c0d6Ab4461BbAa14F5905Ea93ad837"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0xfdC83eC519A4E24edC88E5bD57298edd5451651f"))) {    
      //skip, because presented directly in the manifest
    } else if (event.params.vault.equals(Address.fromString("0xe3638a0B74b5A5C4a220163A05EB6b334e8a165d"))) {    
      //skip, because presented directly in the manifest
    } else {
      Mendi.create(event.params.vault);
    }
  }
}
