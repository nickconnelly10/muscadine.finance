import { ethers } from 'ethers';
import { MoonwellSDK } from '@moonwell-fi/moonwell-sdk';

// Connect to the Base network
const provider = new ethers.providers.JsonRpcProvider('https://base-mainnet.infura.io/v3/44553492de0a443c8068199bac6b5fc7');
const sdk = new MoonwellSDK({ network: 'base', provider });

// Supply Assets to Moonwell
export async function supplyAsset(assetAddress, amount, userSigner) {
  try {
    const tx = await sdk.supply({
      asset: assetAddress,
      amount: ethers.utils.parseUnits(amount, 18), // Convert amount to the correct decimal
      from: userSigner,
    });
    await tx.wait();
    return 'Asset supplied successfully!';
  } catch (error) {
    console.error(error);
    return 'Error supplying asset';
  }
}

// Borrow USDC
export async function borrowUSDC(amount, userSigner) {
  try {
    const tx = await sdk.borrow({
      asset: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22', // Replace with the correct USDC contract address
      amount: ethers.utils.parseUnits(amount, 6), // USDC has 6 decimals
      from: userSigner,
    });
    await tx.wait();
    return 'USDC borrowed successfully!';
  } catch (error) {
    console.error(error);
    return 'Error borrowing USDC';
  }
}
