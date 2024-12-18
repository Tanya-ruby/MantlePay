'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import RewardButton from '../../components/rewardButton';
import Image from 'next/image';

export default function RewardPage() {
  const params = useParams();
  const rewardautolink = params.rewardautolink as string;
  
  const [rewardDetails, setRewardDetails] = useState<{
    recipient: string;
    amount: number;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRewardDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reward?rewardautolink=${rewardautolink}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reward details');
        }
        
        const data = await response.json();
        
        setRewardDetails({
          recipient: data.recipient,
          amount: data.amount,
          message: data.message,
        });
      } catch (error) {
        console.error('Error fetching reward details:', error);
        setError('Unable to load reward details');
      } finally {
        setIsLoading(false);
      }
    }

    if (rewardautolink) {
      fetchRewardDetails();
    }
  }, [rewardautolink]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reward details...</p>
        </div>
      </div>
    );
  }

  if (error || !rewardDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error || 'Unable to load reward'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-green-100">
      {/* Header Section */}
      <div className="flex items-center mb-8">
        <Image src="/MnatlePay.png" alt="MantlePay Logo" width={90} height={90} />
        <h1 className="text-3xl font-bold text-black ml-4">MantlePay</h1>
      </div>


      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Create Reward 🎁
          </h1>

        
          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Recipient</label>
              <p className="text-sm text-gray-600 break-words">{rewardDetails.recipient}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Amount</label>
              <p className="text-lg font-bold text-green-600">{rewardDetails.amount} ETH</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Message</label>
              <p className="text-sm text-gray-600">{rewardDetails.message}</p>
            </div>
          </div>

         
          <RewardButton params={{ rewardautolink }} />
        </div>
      </div>
    </div>
  );
}
