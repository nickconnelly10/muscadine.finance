import { useState } from 'react';
import { useAccount, useSigner } from 'wagmi';
import { supplyAsset, borrowUSDC } from '../utils/moonwell';

export default function Lend() {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [amount, setAmount] = useState('');

  async function handleSupply() {
    if (!signer) return alert('Connect your wallet first!');
    const message = await supplyAsset('0x1234...cBBTC_ADDRESS', amount, signer);
    alert(message);
  }

  async function handleBorrow() {
    if (!signer) return alert('Connect your wallet first!');
    const message = await borrowUSDC(amount, signer);
    alert(message);
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold">Lend & Borrow</h1>
      <input
        type="number"
        placeholder="Enter amount"
        className="border p-2 rounded"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSupply} className="bg-blue-500 text-white p-2 rounded">Supply Asset</button>
      <button onClick={handleBorrow} className="bg-green-500 text-white p-2 rounded">Borrow USDC</button>
    </div>
  );
}
