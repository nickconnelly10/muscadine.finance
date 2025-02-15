export default function handler(req, res) {
    const { address } = req.query;
  
    if (!address) {
      return res.status(400).json({ error: "Wallet address is required" });
    }
  
    // Mock portfolio data (Replace with real API/database call)
    const portfolio = {
      assets: [
        { name: "Ethereum", symbol: "ETH", balance: 1.5 },
        { name: "USD Coin", symbol: "USDC", balance: 250 },
      ],
      history: [
        { date: "2024-02-10", value: 5000 },
        { date: "2024-02-11", value: 5200 },
      ],
      netWorth: 5200,
    };
  
    res.status(200).json(portfolio);
  }
  