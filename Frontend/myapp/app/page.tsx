'use client';

import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-white bg-grid">

      <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <Image
          src="/MnatlePay.png"
          alt="Main Logo"
          width={160}
          height={160}
        />
      </div>

   
      <h1 className="text-6xl font-bold mb-2 text-black">MantlePay</h1>
      <p className="text-2xl italic text-muted-foreground font-serif text-center mb-2">
        👾 Discord Bot to send tokens, rewards, and create bets! 👾
      </p>
      <p className="text-lg text-primary font-bold text-center mb-8">
        A DeFi, SocialFi, and GamFi bot.
      </p>

      {/* Feature Boxes */}
      <div className="flex flex-wrap justify-center gap-8">
        {['Easily Connect Wallet', 'Verify Wallet Connection', 'Send Tokens', 'Reward Users', 'Create Bets'].map((title, index) => (
          <Card key={index} className="w-64 p-6 bg-card text-card-foreground rounded-lg shadow-lg flex flex-col items-center">
            {/* Large Emoji */}
            <span className="text-6xl mb-4" role="img" aria-label={title}>
              {['🔗', '💼', '💸', '🎁', '🎲'][index]}
            </span>
            {/* Title and Info */}
            <h2 className="text-xl font-bold mb-2 text-primary text-center">{title}</h2>
            <p className="text-muted-foreground text-center">
              Use <code className="bg-muted text-primary p-1 rounded">{['connect', 'wallet', 'send', 'reward', 'bet'][index]}</code> to {['link your wallet effortlessly', 'check your wallet details', 'transfer tokens to any user', 'tip and recognize community members', 'create fun betting games'][index]}.
            </p>
          </Card>
        ))}
      </div>

      {/* Powered By Section */}
      <div className="flex flex-col items-center mt-12">
        <h3 className="text-2xl font-semibold mb-4 text-primary">Powered by</h3>
        <div className="flex justify-center space-x-8">
          {['/mantle-mnt-logo-2.png'].map((src, index) => (
            <div key={index} className="w-24 h-24">
              <Image
                src={src}
                alt={`Powered by Logo ${index + 1}`}
                width={100}
                height={100}
              />
            </div>
          ))}
        </div>
      </div>

      
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        <div className="shimmer" />
      </div>
    </div>
  );
}
