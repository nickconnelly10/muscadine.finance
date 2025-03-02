import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [wallet, setWallet] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [netWorth, setNetWorth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  
  const lendingAssets = ["USDC", "cBBTC", "ETH", "rETH", "AERO", "wstETH"];
  const borrowingAssets = ["USDC"];

  useEffect(() => {
    async function connectWallet() {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWallet(address);
          setErrorMessage(null);
        } catch (error) {
          if (error.code === "ACTION_REJECTED") {
            setErrorMessage("User rejected the wallet connection request.");
          } else {
            console.error("Error connecting wallet:", error);
          }
        }
      }
    }
    connectWallet();
  }, []);

  useEffect(() => {
    async function fetchPortfolio() {
      if (!wallet) return;
      try {
        const response = await fetch(`/api/portfolio?address=${wallet}`);
        const data = await response.json();
        setPortfolio(data.assets || []);
        setChartData(data.history || []);
        setNetWorth(data.netWorth || 0);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (wallet) fetchPortfolio();
  }, [wallet]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Muscadine Finance</h1>
      {wallet ? <p className="text-lg">Connected: {wallet}</p> : <p className="text-lg">No wallet connected</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <h2 className="text-xl font-semibold mt-4">Net Worth: ${netWorth ? netWorth.toFixed(2) : "0.00"}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData.length ? chartData : [{ date: "N/A", value: 0 }]}> 
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
      <h2 className="text-xl font-semibold mt-4">Your Assets</h2>
      <ul className="list-disc pl-6">
        {portfolio.length > 0 ? (
          portfolio.map((asset, index) => (
            <li key={index}>{asset.name}: {asset.balance} {asset.symbol}</li>
          ))
        ) : (
          <p>No assets found</p>
        )}
      </ul>
      <Button className="w-full mt-4" onClick={() => router.push('/lending')}>Go to Lending Dashboard</Button>
      <h2 className="text-xl font-semibold mt-4">Borrowing</h2>
      {borrowingAssets.map((asset) => (
        <div key={asset} className="flex justify-between items-center mt-2">
          <span className="text-lg">Borrow {asset}</span>
          <Button>Borrow</Button>
        </div>
      ))}
    </div>
  );
}
