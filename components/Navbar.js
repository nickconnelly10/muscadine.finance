// components/Navbar.js
import { useWallet } from "../context/wallet";
import Link from "next/link";

export default function Navbar() {
  const { account, connectWallet } = useWallet();

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-white">Muscadine Finance</Link>
      <div>
        {account ? (
          <span className="bg-blue-600 px-4 py-2 rounded-lg text-white">{account.slice(0, 6)}...{account.slice(-4)}</span>
        ) : (
          <button onClick={connectWallet} className="bg-blue-600 px-4 py-2 rounded-lg text-white">
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
