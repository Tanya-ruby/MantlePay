'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PlaceBetButton from '../../components/placeBetButton';

export default function PlaceBetPage() {
  const params = useParams();
  const betautolink = params.betautolink as string;
  
  const [betDetails, setBetDetails] = useState<{
    question: string;
    amount: number;
    isResolved: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBetDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/bet?betautolink=${betautolink}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch bet details');
        }
        
        const data = await response.json();
        
        setBetDetails({
          question: data.question,
          amount: data.amount,
          isResolved: data.isResolved
        });
      } catch (error) {
        console.error('Error fetching bet details:', error);
        setError('Unable to load bet details');
      } finally {
        setIsLoading(false);
      }
    }

    if (betautolink) {
      fetchBetDetails();
    }
  }, [betautolink]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bet details...</p>
        </div>
      </div>
    );
  }

  if (error || !betDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error || 'Unable to load bet'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Place Bet</h1>
          
          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Question</label>
              <p className="text-sm text-gray-600 break-words">{betDetails.question}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Bet Amount</label>
              <p className="text-lg font-bold text-green-600">{betDetails.amount} ETH</p>
            </div>
          </div>

          <PlaceBetButton params={{ betautolink }} />
        </div>
      </div>
    </div>
  );
}