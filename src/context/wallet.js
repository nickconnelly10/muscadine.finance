// src/context/wallet.js

import { createContext, useContext, useState, useEffect } from "react";
import { WagmiConfig, createClient, configureChains, mainnet } from "wagmi";
import { http } from "viem"; // Correct import for providers
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

const { chains, publicClient } = configureChains(
  [mainnet],
  [http()] // Use `http()` instead of `publicProvider()`
);

const wagmiClient = createClient({
  autoConnect: true,
  publicClient,
  connectors: [
    new CoinbaseWalletConnector({ chains, options: { appName: "Muscadine Finance" } }),
  ],
});

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (wagmiClient.connector) {
      wagmiClient.connector.getAccount().then(setAccount);
    }
  }, []);

  return (
    <WalletContext.Provider value={{ account, wagmiClient }}>
      <WagmiConfig client={wagmiClient}>{children}</WagmiConfig>
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
