
/ context/wallet.js
import { createContext, useContext, useState, useEffect } from "react";
import { WagmiConfig, createClient, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

const { chains, provider } = configureChains([mainnet], [publicProvider()]);

const wagmiClient = createClient({
  autoConnect: true,
  provider,
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