'use client';

import { useState, useEffect } from 'react';
import { parseEther } from 'viem';
import { ConnectWalletClient } from '../client';
import WalletButton from './walletButton';
import { Address } from 'viem';

export default function SendButton({ 
  params 
}: { 
  params: { sendautolink: string } 
}) {

  const [transactionDetails, setTransactionDetails] = useState<{
    to_address: Address;
    amount: number | string;
  } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

 
  useEffect(() => {
    async function fetchTransactionDetails() {
      try {
        const response = await fetch(
          `/api/send?sendautolink=${params.sendautolink}`,
          { method: "GET" }
        );
        const json = await response.json();
        
    
        console.log('Fetched transaction details:', json);

        setTransactionDetails({
          to_address: json.to_address as Address,
          amount: json.amount
        });
      } catch (error) {
        console.error('Failed to fetch transaction details:', error);
        setMessage('Failed to load transaction details');
      }
    }

    fetchTransactionDetails();
  }, [params.sendautolink]);

 
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
  };


  async function handleSubmit() {
    if (!transactionDetails || !address) return;

    try {
      setMessage('Sending transaction...');
      setIsPending(true);

      const walletClient = ConnectWalletClient();
      const [senderAddress] = await walletClient.getAddresses();


      const amountString = typeof transactionDetails.amount === 'number'
        ? transactionDetails.amount.toString()
        : String(transactionDetails.amount);

  
      const txHash = await walletClient.sendTransaction({
        account: senderAddress as Address,
        to: transactionDetails.to_address,
        value: parseEther(amountString)
      });

      const body = {
        sendautolink: params.sendautolink,
        transactionHash: txHash,
      };

      const response = await fetch(`/api/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setMessage('✅ Transaction successful! You can now close this window.');
      } else {
        const errorJson = await response.json();
        setMessage(`❌ Error updating transaction: ${errorJson.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage(`❌ Transaction failed: ${error}`);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
  
      <WalletButton 
        onAddressChange={handleAddressChange} 
      />

   
      {address && transactionDetails && (
        <div className="w-full max-w-md bg-gray-100 p-6 rounded-lg shadow-md">
  
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Recipient Address</label>
            <p className="text-sm text-gray-600 break-words">
              {transactionDetails.to_address}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Amount</label>
            <p className="text-lg font-semibold">
              {transactionDetails.amount} ETH
            </p>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Send Transaction'}
          </button>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-2 rounded ${
              message.startsWith('✅') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}