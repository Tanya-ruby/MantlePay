'use client';

import { useState, useEffect } from "react";
import { ConnectWalletClient, ConnectPublicClient } from "../client";

// Define props interface to handle the callback for address changes
interface WalletButtonProps {
  onAddressChange?: (address: string) => void;
  isLinking?: boolean;  // Optional prop to show if we're in linking mode
}

export default function WalletButton({ onAddressChange, isLinking }: WalletButtonProps) {
  // State variables for wallet connection
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<Number>(Number(0));
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle wallet connection
  async function handleClick() {
    try {
      setIsConnecting(true);
      
      // Connect to wallet and get client instances
      const walletClient = ConnectWalletClient();
      const publicClient = ConnectPublicClient();
      
      // Get wallet address
      const [address] = await walletClient.getAddresses();
      
      // Get wallet balance
      let balance = await publicClient.getBalance({ address });
      const ethBalance = Number(balance) / Math.pow(10, 18);
      
      // Update local state
      setAddress(address);
      setBalance(ethBalance);
      
      // Notify parent component about the address change
      if (onAddressChange) {
        onAddressChange(address);
      }
    } catch (error) {
      alert(`Transaction failed: ${error}`);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Status 
        address={address} 
        ethBalance={balance} 
        isConnecting={isConnecting}
        isLinking={isLinking} 
      />
      <button
        className="px-8 py-2 rounded-md bg-[#1e2124] flex flex-row items-center justify-center border border-[#1e2124] hover:border hover:border-indigo-600 shadow-md shadow-indigo-500/10 disabled:opacity-50"
        onClick={handleClick}
        disabled={isConnecting}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          alt="MetaMask Fox"
          style={{ width: "25px", height: "25px" }}
        />
        <h1 className="mx-auto">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </h1>
      </button>
    </div>
  );
}

// Enhanced Status component to show different states
function Status({
  address,
  ethBalance,
  isConnecting,
  isLinking
}: {
  address: string | null;
  ethBalance: Number;
  isConnecting: boolean;
  isLinking?: boolean;
}) {
  if (isConnecting) {
    return (
      <div className="flex items-center">
        <div className="border bg-yellow-500 border-yellow-500 rounded-full w-1.5 h-1.5 mr-2 animate-pulse"></div>
        <div>Connecting to wallet...</div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="flex items-center">
        <div className="border bg-red-600 border-red-600 rounded-full w-1.5 h-1.5 mr-2"></div>
        <div>{isLinking ? 'Connect wallet to link with Discord' : 'Disconnected'}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      <div className="border bg-green-500 border-green-500 rounded-full w-1.5 h-1.5 mr-2"></div>
      <div className="text-xs md:text-xs">
        {address} <br /> Balance: {ethBalance.toString()} MNT
        {isLinking && <br />}
        {isLinking && <span className="text-green-500">✓ Ready to link with Discord</span>}
      </div>
    </div>
  );
}