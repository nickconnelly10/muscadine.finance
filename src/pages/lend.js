// pages/lending.js
import { useEffect, useState } from "react";
import { useWallet } from "../context/wallet";
import { ethers } from "ethers";
import { Moonwell } from "@moonwell-fi/moonwell-sdk";

export default function Lending() {
  const { account, provider, signer } = useWallet();
  const [usdcBalance, setUsdcBalance] = useState("0.00");

  useEffect(() => {
    async function fetchUSDCBalance() {
      if (!signer) return;
      const moonwell = new Moonwell(provider);
      const usdcContract = await moonwell.getMarket("USDC");
      const balance = await usdcContract.balanceOf(account);
      setUsdcBalance(ethers.formatUnits(balance, 6));
    }
    fetchUSDCBalance();
  }, [account, signer]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Lending Dashboard</h1>
        <p className="mt-2 text-gray-400">Lend & Borrow assets via Moonwell</p>
        <div className="mt-6 bg-gray-800 p-4 rounded-xl">
          <p>Connected Wallet: {account || "Not Connected"}</p>
          <p>USDC Balance: {usdcBalance}</p>
        </div>
      </div>
    </div>
  );
}
