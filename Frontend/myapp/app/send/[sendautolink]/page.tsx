'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import SendButton from '../../components/sendButton';
import Image from 'next/image';

export default function SendPage() {
  const params = useParams();
  const sendautolink = params.sendautolink as string;

  const [transactionDetails, setTransactionDetails] = useState<{
    to_address: string;
    amount: number;
    user: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    async function fetchTransactionDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/send?sendautolink=${sendautolink}`);

        if (!response.ok) {
          throw new Error('Failed to fetch transaction details');
        }

        const data = await response.json();

        setTransactionDetails({
          to_address: data.to_address,
          amount: data.amount,
          user: data.user,
        });
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        setError('Unable to load transaction details');
      } finally {
        setIsLoading(false);
      }
    }

    if (sendautolink) {
      fetchTransactionDetails();
    }
  }, [sendautolink]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }


  if (error || !transactionDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error || 'Unable to load transaction'}</span>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-green-100">
     
      <div className="flex items-center mb-8">
        <Image src="/MnatlePay.png" alt="MantlePay Logo" width={90} height={90} />
        <h1 className="text-4xl font-bold text-black ml-4">MantlePay</h1>
      </div>

      
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Send Transaction 💰
          </h1>

          <div className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Recipient Address</label>
              <p className="text-sm text-gray-600 break-words">{transactionDetails.to_address}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Amount</label>
              <p className="text-lg font-bold text-green-600">{transactionDetails.amount} ETH</p>
            </div>
          </div>


          <SendButton params={{ sendautolink }} />
        </div>
      </div>
    </div>
  );
}
