import { WagmiConfig, wagmiClient } from '../context/wallet';

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}

export default MyApp;
