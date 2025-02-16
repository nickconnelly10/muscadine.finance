// pages/index.js
import { useEffect, useState } from "react";
import { useWallet } from "../context/wallet";
import Link from "next/link";

export default function Home() {
  const { account } = useWallet();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    async function fetchBalance() {
      if (!account) return;
      setBalance("0.00 USDC"); // Placeholder
    }
    fetchBalance();
  }, [account]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Welcome to Muscadine Finance</h1>
        <p className="mt-2 text-gray-400">A DeFi dApp powered by Moonwell & Base Network</p>
        <div className="mt-6 bg-gray-800 p-4 rounded-xl">
          <p>Connected Wallet: {account || "Not Connected"}</p>
          <p>Balance: {balance}</p>
        </div>
        <div className="mt-6 flex gap-4">
          <Link href="/lending" className="px-4 py-2 bg-blue-600 rounded-lg">Go to Lending</Link>
        </div>
      </div>
    </div>
  );
}