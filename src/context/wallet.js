// context/wallet.js
import { createContext, useContext, useState, useEffect } from "react";
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { http } from "viem";
import { coinbaseWallet } from "wagmi/connectors";

const { chains, publicClient } = configureChains(
  [mainnet],
  [http()]
);

const wagmiClient = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [
    coinbaseWallet({ chains, options: { appName: "Muscadine Finance" } }),
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
      <WagmiConfig config={wagmiClient}>{children}</WagmiConfig>
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}