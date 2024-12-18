'use client';

import { useState, useEffect } from 'react';
import { parseEther, Address } from 'viem';
import { ConnectWalletClient, ConnectPublicClient } from '../client';
import WalletButton from './walletButton';
import { betABI } from '@/abi/bet';

interface CreateBetButtonProps {
  params: {
    betautolink: string;
  };
}

interface BetDetails {
  creator: string;
  question: string;
  amount: number;
}

export default function CreateBetButton({ params }: CreateBetButtonProps) {
  const [betDetails, setBetDetails] = useState<BetDetails | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBetDetails() {
      try {
        const response = await fetch(
          `/api/bet?betautolink=${params.betautolink}`,
          { method: "GET" }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch bet details');
        }
        
        const data = await response.json();
        console.log('Fetched bet details:', data);

        setBetDetails({
          creator: data.creator,
          question: data.question,
          amount: data.amount,
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

  async function handleSubmit() {
    if (!betDetails || !address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setMessage('Creating bet...');
      setIsPending(true);
      setError(null);

      const walletClient = ConnectWalletClient();
      const publicClient = ConnectPublicClient(false);
      const [senderAddress] = await walletClient.getAddresses();

      const amountString = typeof betDetails.amount === 'number'
        ? betDetails.amount.toString()
        : String(betDetails.amount);

      console.log('Preparing transaction with:', {
        betId: params.betautolink,
        question: betDetails.question,
        amount: amountString,
        sender: senderAddress
      });

      try {
        const { request } = await publicClient.simulateContract({
          address: process.env.NEXT_PUBLIC_BET_CONTRACT_ADDRESS as Address,
          abi: betABI,
          functionName: 'createBet',
          account: senderAddress,
          args: [params.betautolink, betDetails.question],
          value: parseEther(amountString)
        });

        const txHash = await walletClient.writeContract(request);
        console.log('Transaction hash:', txHash);

       
        const response = await fetch('/api/bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            betautolink: params.betautolink,
            transactionHash: txHash,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update bet status');
        }

        setMessage('✅ Bet created successfully! You can now close this window.');
      } catch (error) {
        console.error('Contract interaction failed:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create bet on blockchain');
      }
    } catch (error) {
      console.error('Error creating bet:', error);
      setError(error instanceof Error ? error.message : 'Failed to create bet');
      setMessage('');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <WalletButton onAddressChange={handleAddressChange} />

      {address && betDetails && (
        <div className="w-full max-w-md bg-gray-100 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Question</label>
            <p className="text-sm text-gray-600 break-words">
              {betDetails.question}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Initial Bet Amount</label>
            <p className="text-lg font-semibold text-green-600">
              {betDetails.amount} ETH
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating Bet...' : 'Create Bet'}
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
    </div>
  );
}