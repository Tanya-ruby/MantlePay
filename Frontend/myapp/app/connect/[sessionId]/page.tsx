'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import WalletButton from '../../components/walletButton';
import { ConnectWalletClient } from '@/app/client'; 
import Image from 'next/image';

export default function ConnectPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [linkStatus, setLinkStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [currentAddress, setCurrentAddress] = useState<string>('');


  const MESSAGE = "Link Discord Account";


  const handleAddressChange = async (address: string) => {
    setCurrentAddress(address);

    try {
    
      const walletClient = ConnectWalletClient();


      const signature = await walletClient.signMessage({
        account: address as `0x${string}`,
        message: MESSAGE,
      });


      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          address,
          signature,
          message: MESSAGE,
        }),
      });

      if (response.ok) {
        setLinkStatus('success');
        setTimeout(() => {
          window.close(); 
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        setLinkStatus('error');
      }
    } catch (error) {
      console.error('Error updating address or signing message:', error);
      setLinkStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-green-100 bg-grid">

      <div className="flex items-center mb-8">
        <Image src="/MnatlePay.png" alt="MantlePay Logo" width={60} height={60} />
        <h1 className="text-4xl font-bold text-black ml-4">MantlePay</h1>
      </div>

      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <div className="flex flex-col items-center gap-6 w-full">

          {linkStatus === 'success' ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your wallet has been linked to Discord.</span>
              <p className="text-sm">This window will close automatically...</p>
            </div>
          ) : linkStatus === 'error' ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> Failed to link wallet. Please try again.</span>
            </div>
          ) : (
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold mb-2 flex items-center justify-center">
                Link Wallet to Discord <span className="ml-2 text-4xl">🔗</span>
              </h1>
              <p className="text-gray-600">
                Connect your wallet and sign a message to link it with your Discord account.
                This will allow you to use your wallet address in Discord commands.
              </p>
            </div>
          )}


          <div className="w-full max-w-md">
            <WalletButton 
              onAddressChange={handleAddressChange}
              isLinking={true}
            />
          </div>


          <div className="flex flex-col gap-2 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                1
              </div>
              <span>Started from Discord</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                2
              </div>
              <span>Connect and sign with wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full ${linkStatus === 'success' ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center text-white text-xs`}>
                3
              </div>
              <span>Link completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
