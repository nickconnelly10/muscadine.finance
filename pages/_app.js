// pages/_app.js
import "../styles/globals.css";
import { WalletProvider } from "../context/wallet";
import Navbar from "../components/Navbar";

function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider>
      <div className="bg-gray-900 text-white min-h-screen">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </WalletProvider>
  );
}

export default MyApp;
