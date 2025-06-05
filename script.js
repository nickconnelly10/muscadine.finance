// script.js

/* ── CONFIGURATION ─────────────────────────────────────────────────────────── */

// Morpho USDC Vault (ERC-4626) on Base
const MORPHO_VAULT_ADDRESS = "0xf7e26Fa48A568b8b0038e104DfD8ABdf0f99074F";

// USDC token (6 decimals) on Base
const USDC_ADDRESS = "0xd9AaEC86B6D909A6A1dA24e3e0E010CA54b9221f";

// Minimal ABIs for ERC-4626 vault + ERC-20 approval
const vaultAbi = [
  // Read user’s share balance
  "function balanceOf(address owner) view returns (uint256)",
  // Convert shares → USDC assets
  "function convertToAssets(uint256 shares) view returns (uint256)",
  // Deposit USDC assets → mint shares
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  // Withdraw USDC assets (burn shares)
  "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)"
];

const erc20Abi = [
  // Check how many tokens vault is allowed to spend
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
const usdcValueSpan    = document.getElementById("usdcValue");
const interestSpan     = document.getElementById("interestEarned");
const originalInput    = document.getElementById("originalDeposit");
const amountInput      = document.getElementById("amountInput");
const depositButtonEl  = document.getElementById("depositButton");
const withdrawButtonEl = document.getElementById("withdrawButton");
const statusDiv        = document.getElementById("status");

/* ── INIT (check for wallet + set up providers/contracts) ───────────────────── */
async function init() {
  if (typeof window.ethereum === "undefined") {
    statusDiv.innerText =
      "⚠️ No injected wallet found. Please install MetaMask (or another Base-compatible wallet).";
    connectButton.disabled = true;
    return;
  }

  // Wrap window.ethereum in Ethers.js provider (v6 style)
  provider = new ethers.BrowserProvider(window.ethereum);

  // Set up “read-only” contract instances for vault + USDC;
  // once we connect, we'll re-initialize with signer for write()
  vaultContract = new ethers.Contract(MORPHO_VAULT_ADDRESS, vaultAbi, provider);
  usdcContract  = new ethers.Contract(USDC_ADDRESS, erc20Abi, provider);
}

/* ── CONNECT WALLET ─────────────────────────────────────────────────────────── */
async function connectWallet() {
  statusDiv.innerText = ""; // clear previous messages

  try {
    // 1. Ask MetaMask to connect accounts
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    ... // Display address
    walletAddressP.innerText = `Connected: ${userAddress}`;

    // 2. Re-instantiate contracts with signer so we can send TXs
    vaultContract = vaultContract.connect(signer);
    usdcContract  = usdcContract.connect(signer);

    // 3. Show the vaultInfo block, then fetch initial vault data
    vaultInfoDiv.classList.remove("hidden");
    await fetchVaultInfo();
  } catch (err) {
    statusDiv.innerText = `❌ ${err.message}`;
  }
}

/* ── FETCH + DISPLAY VAULT INFO ────────────────────────────────────────────── */
async function fetchVaultInfo() {
  statusDiv.innerText = "⏳ Fetching vault info…";

  try {
    // 1) Read shares owned by the user
    const sharesBN = await vaultContract.balanceOf(userAddress);

    // 2) Convert those shares → USDC assets (BigNumber with 6 decimals)
    const usdcAssetsBN = await vaultContract.convertToAssets(sharesBN);

    // 3) Format to human-readable
    const usdcValue = ethers.formatUnits(usdcAssetsBN, 6); // e.g. "1.234567"
    usdcValueSpan.innerText = parseFloat(usdcValue).toFixed(6);

    // 4) Calculate “interest earned”:
    //    (current USDC value) minus (user-entered original deposit)
    const origStr = originalInput.value.trim();
    let interestText = "—";
    if (origStr && !isNaN(origStr)) {
      const origBN = ethers.parseUnits(origStr, 6);
      const diffBN = usdcAssetsBN.sub(origBN);
      const diff = ethers.formatUnits(diffBN, 6);
      interestText =
        parseFloat(diff) > 0 ? parseFloat(diff).toFixed(6) : "0.000000";
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
    // 1) Parse to USDC’s 6 decimals
    const amountBN = ethers.parseUnits(amtStr, 6);

    // 2) Check allowance → if below desired, send approve()
    const currentAllowance = await usdcContract.allowance(
      userAddress,
      MORPHO_VAULT_ADDRESS
    );
    if (currentAllowance.lt(amountBN)) {
      statusDiv.innerText = "📝 Approving vault to spend your USDC…";
      const approveTx = await usdcContract.approve(
        MORPHO_VAULT_ADDRESS,
        amountBN
      );
      await approveTx.wait();
    }

    // 3) Call deposit(assets, receiver)
    statusDiv.innerText = "⏳ Sending deposit transaction…";
    const tx = await vaultContract.deposit(amountBN, userAddress);
    await tx.wait();

    statusDiv.innerText = `✅ Deposited ${amtStr} USDC! Refreshing…`;
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
    // 1) Parse to USDC’s 6 decimals
    const amountBN = ethers.parseUnits(amtStr, 6);

    // 2) Call withdraw(assets, receiver, owner)
    statusDiv.innerText = "⏳ Sending withdraw transaction…";
    const tx = await vaultContract.withdraw(
      amountBN,
      userAddress,
      userAddress
    );
    await tx.wait();

    statusDiv.innerText = `✅ Withdrew ${amtStr} USDC! Refreshing…`;
    await fetchVaultInfo();
  } catch (err) {
    statusDiv.innerText = `❌ Withdraw failed: ${err.message}`;
  }
}

/* ── EVENT LISTENERS ─────────────────────────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", async () => {
  await init();

  connectButton.addEventListener("click", connectWallet);

  // Whenever “original deposit” changes, recalc interest
  originalInput.addEventListener("input", () => {
    if (userAddress) fetchVaultInfo();
  });

  depositButtonEl.addEventListener("click", depositUSDC);
  withdrawButtonEl.addEventListener("click", withdrawUSDC);
});
