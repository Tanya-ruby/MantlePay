'use client';

import { useState, useEffect } from 'react';
import { parseEther, Address } from 'viem';
import { ConnectWalletClient, ConnectPublicClient } from '../client';
import WalletButton from './walletButton';
import { betABI } from '@/abi/bet';

interface PlaceBetButtonProps {
  params: {
    betautolink: string;
  };
}

interface BetDetails {
  question: string;
  amount: number;
  isResolved: boolean;
  yesCount: number;
  noCount: number;
}

export default function PlaceBetButton({ params }: PlaceBetButtonProps) {
  const [betDetails, setBetDetails] = useState<BetDetails | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBetDetails() {
      try {
        const publicClient = ConnectPublicClient(false);
        
        const betInfo = await publicClient.readContract({
          address: process.env.NEXT_PUBLIC_BET_CONTRACT_ADDRESS as Address,
          abi: betABI,
          functionName: 'getBetInfo',
          args: [params.betautolink]
        });

        setBetDetails({
          question: betInfo[0],
          amount: Number(betInfo[1]) / 1e18,
          isResolved: betInfo[2],
          yesCount: Number(betInfo[4]),
          noCount: Number(betInfo[5])
        });
      } catch (error) {
        console.error('Failed to fetch bet details:', error);
        setError('Failed to load bet details');
      }
    }

    fetchBetDetails();
  }, [params.betautolink]);

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    setError(null);
  };

  async function handlePlaceBet() {
    if (!betDetails || !address || choice === null) {
      setError('Please connect wallet and choose Yes or No');
      return;
    }

    try {
      setMessage('Placing bet...');
      setIsPending(true);
      setError(null);

      const walletClient = ConnectWalletClient();
      const publicClient = ConnectPublicClient(false);
      const [senderAddress] = await walletClient.getAddresses();

      try {
        const { request } = await publicClient.simulateContract({
          address: process.env.NEXT_PUBLIC_BET_CONTRACT_ADDRESS as Address,
          abi: betABI,
          functionName: 'placeBet',
          account: senderAddress,
          args: [params.betautolink, choice],
          value: parseEther(betDetails.amount.toString())
        });

        const txHash = await walletClient.writeContract(request);
        console.log('Transaction hash:', txHash);

        
        const response = await fetch('/api/placebet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            betautolink: params.betautolink,
            transactionHash: txHash,
            choice,
            placer: address
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update bet placement');
        }

        setMessage('✅ Bet placed successfully!');
      } catch (error) {
        console.error('Contract interaction failed:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to place bet on blockchain');
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      setError(error instanceof Error ? error.message : 'Failed to place bet');
      setMessage('');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <WalletButton onAddressChange={handleAddressChange} />

      {address && betDetails && !betDetails.isResolved && (
        <div className="w-full max-w-md bg-gray-100 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Question</label>
            <p className="text-sm text-gray-600 break-words">
              {betDetails.question}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Bet Amount</label>
            <p className="text-lg font-semibold text-green-600">
              {betDetails.amount} ETH
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Current Votes</label>
            <div className="flex justify-between">
              <span>Yes: {betDetails.yesCount}</span>
              <span>No: {betDetails.noCount}</span>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setChoice(true)}
              className={`flex-1 py-2 px-4 rounded-lg transition duration-300 ${
                choice === true 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setChoice(false)}
              className={`flex-1 py-2 px-4 rounded-lg transition duration-300 ${
                choice === false 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              No
            </button>
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={isPending || choice === null}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Placing Bet...' : 'Place Bet'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded ${
              message.startsWith('✅') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      )}

      {betDetails?.isResolved && (
        <div className="w-full max-w-md bg-gray-100 p-6 rounded-lg shadow-md text-center">
          <p className="text-lg font-bold text-gray-700">This bet has been resolved</p>
        </div>
      )}
    </div>
  );
}