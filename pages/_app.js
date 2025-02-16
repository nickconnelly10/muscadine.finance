import { WagmiConfig, wagmiClient } from '../src/context/wallet'; // Adjust path if needed
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiClient}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}

export default MyApp;
