'use client';

import { useState, useEffect } from 'react';
import { parseEther, Address } from 'viem';
import { ConnectWalletClient, ConnectPublicClient } from '../client';
import WalletButton from './walletButton';
import { rewardsABI } from '../../abi/rewards';

interface RewardButtonProps {
  params: {
    rewardautolink: string;
  };
}

interface RewardDetails {
  recipient: string;
  amount: number;
  message: string;
  rewarder: string;
}

export default function RewardButton({ params }: RewardButtonProps) {
  const [rewardDetails, setRewardDetails] = useState<RewardDetails | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRewardDetails() {
      try {
        const response = await fetch(
          `/api/reward?rewardautolink=${params.rewardautolink}`,
          { method: "GET" }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch reward details');
        }
        
        const data = await response.json();
        console.log('Fetched reward details:', data);

        setRewardDetails({
          recipient: data.recipient,
          amount: data.amount,
          message: data.message,
          rewarder: data.rewarder
        });
      } catch (error) {
        console.error('Failed to fetch reward details:', error);
        setError('Failed to load reward details');
      }
    }

    fetchRewardDetails();
  }, [params.rewardautolink]);

  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    setError(null);
  };

  async function handleSubmit() {
    if (!rewardDetails || !address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setMessage('Creating reward...');
      setIsPending(true);
      setError(null);

      
      const walletClient = ConnectWalletClient();
      const publicClient = ConnectPublicClient(false); 
      const [senderAddress] = await walletClient.getAddresses();

      const amountString = typeof rewardDetails.amount === 'number'
        ? rewardDetails.amount.toString()
        : String(rewardDetails.amount);

      console.log('Preparing transaction with:', {
        recipient: rewardDetails.recipient,
        amount: amountString,
        sender: senderAddress
      });

      try {
        
        const { request } = await publicClient.simulateContract({
          address: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS as Address,
          abi: rewardsABI,
          functionName: 'sendReward',
          account: senderAddress,
          args: [rewardDetails.recipient],
          value: parseEther(amountString)
        });


        const txHash = await walletClient.writeContract(request);
        console.log('Transaction hash:', txHash);


        const response = await fetch('/api/reward', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rewardautolink: params.rewardautolink,
            transactionHash: txHash,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update reward status');
        }

        setMessage('✅ Reward created successfully! You can now close this window.');
      } catch (error) {
        console.error('Contract interaction failed:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create reward on blockchain');
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      setError(error instanceof Error ? error.message : 'Failed to create reward');
      setMessage('');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <WalletButton onAddressChange={handleAddressChange} />

      {address && rewardDetails && (
        <div className="w-full max-w-md bg-gray-100 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Recipient ID</label>
            <p className="text-sm text-gray-600 break-words">
              {rewardDetails.recipient}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Amount</label>
            <p className="text-lg font-semibold text-green-600">
              {rewardDetails.amount} MNT
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Message</label>
            <p className="text-sm text-gray-600">
              {rewardDetails.message}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating Reward...' : 'Create Reward'}
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