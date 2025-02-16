export default async function handler(req, res) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    // Simulating fetching portfolio data
    const mockData = {
      assets: [
        { name: "Ethereum", symbol: "ETH", balance: 1.5 },
        { name: "USD Coin", symbol: "USDC", balance: 2500 },
      ],
      history: [
        { date: "2024-02-10", value: 1000 },
        { date: "2024-02-11", value: 1500 },
        { date: "2024-02-12", value: 1300 },
      ],
      netWorth: 4000,
    };

    res.status(200).json(mockData);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
}
