import { createPublicClient, createWalletClient, http, custom } from "viem";
import { mantleSepoliaTestnet } from "viem/chains";
import "viem/window";

export function ConnectWalletClient() {
  if (!window.ethereum) {
    const errorMessage = "MetaMask or another web3 wallet is not installed. Please install one to proceed.";
    throw new Error(errorMessage);
  }

  const walletClient = createWalletClient({
    chain: mantleSepoliaTestnet,
    transport: custom(window.ethereum!),
  });
  return walletClient;
}

export function ConnectPublicClient(isServer = false) {
 
  if (isServer) {
    return createPublicClient({
      chain: mantleSepoliaTestnet,
      transport: http()
    });
  }


  if (!window.ethereum) {
    const errorMessage = "MetaMask or another web3 wallet is not installed. Please install one to proceed.";
    throw new Error(errorMessage);
  }

  return createPublicClient({
    chain: mantleSepoliaTestnet,
    transport: custom(window.ethereum)
  });
}