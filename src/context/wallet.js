// context/wallet.js
import { createContext, useContext, useState, useEffect } from "react";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains([mainnet], [publicProvider()]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new CoinbaseWalletConnector({ chains })
  ],
  provider,
});

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    async function loadWallet() {
      if (wagmiClient.autoConnect) {
        const accounts = await wagmiClient.connector.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    }
    loadWallet();
  }, []);

  const connectWallet = async () => {
    try {
      await wagmiClient.connector.connect();
      const accounts = await wagmiClient.connector.getAccounts();
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  return (
    <WalletContext.Provider value={{ account, connectWallet, provider, signer }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}