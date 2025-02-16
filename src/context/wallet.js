import { createConfig, configureChains, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors/injected';

const { chains, publicClient } = configureChains([base, mainnet], [publicProvider()]);

const wagmiClient = createConfig({
  autoConnect: true,
  publicClient,
  connectors: [injected()],
});

export { WagmiConfig, wagmiClient, chains };
