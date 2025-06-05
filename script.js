// script.js

/* ── CONFIGURATION ─────────────────────────────────────────────────────────── */

// Morpho USDC Vault (ERC-4626) on Base
const MORPHO_VAULT_ADDRESS = "0xf7e26Fa48A568b8b0038e104DfD8ABdf0f99074F";

// USDC token on Base (6 decimals)
const USDC_ADDRESS = "0xd9AaEC86B6D909A6A1dA24e3e0E010CA54b9221f";

// Minimal ERC-4626 ABI snippets + ERC-20 for approve/allowance/balanceOf
const vaultAbi = [
  // Read user’s share balance
  "function balanceOf(address owner) view returns (uint256)",
  // Convert shares → USDC assets
  "function convertToAssets(uint256 shares) view returns (uint256)",
  // Deposit (USDC assets → get vault shares)
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  // Withdraw (redeem assets)
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)"
];

const erc20Abi = [
  // Check allowance
  "function allowance(address owner, address spender) view returns (uint256)",
  // Approve vault to spend USDC
  "function approve(address spender, uint256 amount) returns (bool)"
];

/* ── GLOBAL VARIABLES ───────────────────────────────────────────────────────── */
let provider, signer, userAddress;
let vaultContract, usdcContract;

/* ── ELEMENT REFERENCES ─────────────────────────────────────────────────────── */
const connectButton    = document.getElementById("connectButton");
const walletAddressP   = document.getElementById("walletAddress");
const vaultInfoDiv     = document.getElementById("vaultInfo");
const shareBalanceSpan = document.getElementById("shareBalance");
const usdcValueSpan    = document.getElementById("usdcValue");
const interestSpan     = document.getElementById("interestEarned");
const originalInput    = document.getElementById("originalDeposit");
const amountInput      = document.getElementById("amountInput");
const depositButtonEl  = document.getElementById("depositButton");
const withdrawButtonEl = document.getElementById("withdrawButton");
const statusDiv        = document.getElementById("status");

/* ── INIT ───────────────────────────────────────────────────────────────────── */
async function init() {
  if (typeof window.ethereum === "undefined") {
    statusDiv.innerText = "⚠️ Please install MetaMask (or another Base-compatible wallet).";
    connectButton.disabled = true;
    return;
  }

  // Wrap window.ethereum in an Ethers provider
  provider = new ethers.BrowserProvider(window.ethereum);
  vaultContract = new ethers.Contract(MORPHO_VAULT_ADDRESS, vaultAbi, provider);
  usdcContract  = new ethers.Contract(USDC_ADDRESS, erc20Abi, provider);
}

/* ── CONNECT WALLET ─────────────────────────────────────────────────────────── */
async function connectWallet() {
  try {
    // Request accounts
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    walletAddressP.innerText = `Connected: ${userAddress}`;
    statusDiv.innerText = "";

    // Re-instantiate contracts with signer so we can send txs
    vaultContract = vaultContract.connect(signer);
    usdcContract  = usdcContract.connect(signer);

    // Once connected, show the vault info area
    vaultInfoDiv.classList.remove("hidden");

    // Immediately fetch & display vault info
    await fetchVaultInfo();
  } catch (err) {
    statusDiv.innerText = `❌ Connection failed: ${err.message}`;
  }
}

/* ── FETCH + DISPLAY VAULT INFO ────────────────────────────────────────────── */
async function fetchVaultInfo() {
  statusDiv.innerText = "⏳ Fetching vault info...";
  try {
    // 1) Get user’s vault share balance (in “shares”)
    const sharesBN = await vaultContract.balanceOf(userAddress);
    // 2) Convert shares → USDC assets (6 decimal places)
    const usdcBN = await vaultContract.convertToAssets(sharesBN);

    // Convert BigNumber → human string
    const shares = ethers.formatUnits(sharesBN, 0);      // shares are typically an integer
    const usdcValue = ethers.formatUnits(usdcBN, 6);     // USDC has 6 decimals

    shareBalanceSpan.innerText = shares;
    usdcValueSpan.innerText = parseFloat(usdcValue).toFixed(6);

    // 3) Compute “interest earned”: user enters “original deposit” in USDC
    const originalStr = originalInput.value.trim();
    let interestText = "—";
    if (originalStr && !isNaN(originalStr)) {
      const origBN   = ethers.parseUnits(originalStr, 6);
      const interestBN = usdcBN.sub(origBN);  // current USDC value − original deposit
      const interest = ethers.formatUnits(interestBN, 6);
      // If negative (e.g. user typed more original than current), show “0.000000”
      interestText = parseFloat(interest) > 0
        ? parseFloat(interest).toFixed(6)
        : "0.000000";
    }
    interestSpan.innerText = interestText;

    statusDiv.innerText = "✅ Vault info updated.";
  } catch (err) {
    statusDiv.innerText = `❌ Failed to fetch vault info: ${err.message}`;
  }
}

/* ── DEPOSIT USDC ────────────────────────────────────────────────────────────── */
async function depositUSDC() {
  statusDiv.innerText = "";
  const amtStr = amountInput.value.trim();
  if (!amtStr || isNaN(amtStr) || Number(amtStr) <= 0) {
    statusDiv.innerText = "⚠️ Enter a valid USDC amount to deposit.";
    return;
  }

  try {
    // 1) Convert to USDC’s 6 decimals
    const amountBN = ethers.parseUnits(amtStr, 6);

    // 2) Check allowance: does vault have permission to pull our USDC?
    const currentAllowance = await usdcContract.allowance(userAddress, MORPHO_VAULT_ADDRESS);
    if (currentAllowance.lt(amountBN)) {
      statusDiv.innerText = "📝 Approving vault to spend your USDC...";
      const approveTx = await usdcContract.approve(MORPHO_VAULT_ADDRESS, amountBN);
      await approveTx.wait();
    }

    // 3) Call deposit(assets, receiver)
    statusDiv.innerText = "⏳ Sending deposit transaction...";
    const tx = await vaultContract.deposit(amountBN, userAddress);
    await tx.wait();

    statusDiv.innerText = `✅ Deposited ${amtStr} USDC! Refreshing info…`;
    await fetchVaultInfo();
  } catch (err) {
    statusDiv.innerText = `❌ Deposit failed: ${err.message}`;
  }
}

/* ── WITHDRAW USDC ──────────────────────────────────────────────────────────── */
async function withdrawUSDC() {
  statusDiv.innerText = "";
  const amtStr = amountInput.value.trim();
  if (!amtStr || isNaN(amtStr) || Number(amtStr) <= 0) {
    statusDiv.innerText = "⚠️ Enter a valid USDC amount to withdraw.";
    return;
  }

  try {
    // 1) Convert to USDC’s 6 decimals
    const amountBN = ethers.parseUnits(amtStr, 6);

    // 2) Call withdraw(assets, receiver, owner)
    statusDiv.innerText = "⏳ Sending withdraw transaction...";
    const tx = await vaultContract.withdraw(amountBN, userAddress, userAddress);
    await tx.wait();

    statusDiv.innerText = `✅ Withdrew ${amtStr} USDC! Refreshing info…`;
    await fetchVaultInfo();
  } catch (err) {
    statusDiv.innerText = `❌ Withdraw failed: ${err.message}`;
  }
}

/* ── EVENT LISTENERS ─────────────────────────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", async () => {
  await init();
  connectButton.addEventListener("click", connectWallet);

  // When user changes “original deposit,” update interest display automatically
  originalInput.addEventListener("input", () => {
    if (userAddress) fetchVaultInfo();
  });

  depositButtonEl.addEventListener("click", depositUSDC);
  withdrawButtonEl.addEventListener("click", withdrawUSDC);
});
