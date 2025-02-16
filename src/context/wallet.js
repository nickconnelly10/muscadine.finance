import { createClient, configureChains, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet, base } from 'wagmi/chains';
import { injectedConnector } from 'wagmi/connectors/injected';

const { chains, provider } = configureChains([base], [publicProvider()]);

const wagmiClient = createClient({
  autoConnect: true,
  provider,
  connectors: [injectedConnector()],
});

export { WagmiConfig, wagmiClient, chains };
