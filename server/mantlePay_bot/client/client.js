// client.js
import { createPublicClient, createWalletClient, http } from "viem";
import { mantleSepoliaTestnet } from "viem/chains";
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

// Load environment variables
const privateKey = process.env.PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;

// Validations
if (!privateKey || !rpcUrl || !contractAddress) {
  throw new Error(
    "Missing environment variables: Please set PRIVATE_KEY, RPC_URL, and CONTRACT_ADDRESS in your .env file"
  );
}

// Create the account from private key
const account = privateKeyToAccount(privateKey);
console.log("Bot operating with account:", account.address);

// Create public client for reading
export const publicClient = createPublicClient({
  chain: mantleSepoliaTestnet,
  transport: http(rpcUrl)
});

// Create wallet client for writing
export const walletClient = createWalletClient({
  account,
  chain: mantleSepoliaTestnet,
  transport: http(rpcUrl)
});

export { account };