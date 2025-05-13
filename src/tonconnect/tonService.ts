import { ref, watch } from "vue";
import { TonClient } from "@ton/ton";
import { Address as TonClientAddress } from "@ton/core";
import { useTonWallet } from "./useTonWallet";
import TonWeb from "tonweb";
import { useTonConnectUI } from "./useTonConnectUI";

// -- TON client (native coin) setup --
let tonClient: TonClient;
try {
  tonClient = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: import.meta.env.VITE_TONCENTER_API_KEY,
  });
} catch (error) {
  console.error("Failed to initialize TON client:", error);
}

// -- Reactive state for TON balance --
const tonBalance = ref<string>("0");
const isTonLoading = ref(false);
const hasTonError = ref(false);
const tonErrorMessage = ref("");

// -- Reactive state for Jetton balance --
const jettonBalance = ref<string>("0");
const isJettonLoading = ref(false);
const hasJettonError = ref(false);
const jettonErrorMessage = ref("");

// -- TonWeb setup for Jetton --
const tonweb = new TonWeb(
  new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
    apiKey: import.meta.env.VITE_TONCENTER_API_KEY,
  })
);
const { JettonMinter, JettonWallet } = TonWeb.token.jetton;
const { Address: TonWebAddress } = TonWeb.utils;

// Replace with your on-chain Jetton master address:
const JETTON_MASTER = import.meta.env.VITE_TON_JETTON_ADDRESS;

/**
 * Fetch native TON balance.
 */
async function fetchTonBalance(walletAddress: string) {
  hasTonError.value = false;
  tonErrorMessage.value = "";
  if (!walletAddress || !tonClient) {
    tonBalance.value = "0";
    return;
  }
  try {
    isTonLoading.value = true;
    const raw = await tonClient.getBalance(
      TonClientAddress.parse(walletAddress)
    );
    const ton = Number(raw) / 1e9;
    tonBalance.value = ton.toFixed(4);
  } catch (e) {
    console.error("Error fetching TON balance:", e);
    hasTonError.value = true;
    tonErrorMessage.value = "Failed to fetch TON balance";
    tonBalance.value = "0";
  } finally {
    isTonLoading.value = false;
  }
}

/**
 * Fetch Jetton balance (and symbol) for the given owner wallet.
 * Uses TonWeb.token.jetton.JettonMinter and JettonWallet :contentReference[oaicite:1]{index=1}.
 */
async function fetchJettonBalance(ownerAddress: string) {
  hasJettonError.value = false;
  jettonErrorMessage.value = "";
  if (!ownerAddress) {
    jettonBalance.value = "0";
    return;
  }
  try {
    isJettonLoading.value = true;

    // 1. Create a JettonMinter wrapper
    // @ts-expect-error - JettonMinter
    const minter = new JettonMinter(tonweb.provider, {
      address: new TonWebAddress(JETTON_MASTER),
    });

    console.log("minter", minter);
    // 2. Get token metadata (name, symbol, decimals)
    const meta = await minter.getJettonData();
    console.log("meta", meta);

    // 3. Derive the user's Jetton‐wallet address
    const walletAddr = await minter.getJettonWalletAddress(
      new TonWebAddress(ownerAddress)
    );

    // 4. Create a JettonWallet wrapper and fetch its data
    const wallet = new JettonWallet(tonweb.provider, {
      address: walletAddr,
    });
    console.log("wallet", wallet);
    const data = await wallet.getData();

    console.log("data", data);

    // 5. Format balance using decimals
    const raw = data.balance.toString(); // big integer as string
    const human = Number(raw) / 10 ** 9;
    jettonBalance.value = human.toFixed(4);
    console.log("jettonBalance", jettonBalance.value);
  } catch (e) {
    console.error("Error fetching Jetton balance:", e);
    hasJettonError.value = true;
    jettonErrorMessage.value = "Failed to fetch Jetton balance";
    jettonBalance.value = "0";
  } finally {
    isJettonLoading.value = false;
  }
}

/**
 * Vue hook combining both balances.
 */
export function useTonBalance() {
  const { wallet } = useTonWallet();

  // Whenever the connected wallet changes, refetch
  watch(
    wallet,
    async (w) => {
      const addr = w?.account.address ?? "";
      await fetchTonBalance(addr);
      await fetchJettonBalance(addr);
    },
    { immediate: true }
  );

  return {
    // TON
    balance: tonBalance,
    isLoading: isTonLoading,
    hasError: hasTonError,
    errorMessage: tonErrorMessage,
    fetchBalance: () => fetchTonBalance(wallet.value?.account.address ?? ""),

    // Jetton
    jettonBalance,
    isJettonLoading,
    hasJettonError,
    jettonErrorMessage,
    fetchJettonBalance: () =>
      fetchJettonBalance(wallet.value?.account.address ?? ""),
  };
}

/**
 * Burns specified amount of jettons from the user's wallet.
 * Returns transaction hash if successful, null otherwise.
 */
export async function burnJettons(
  walletAddress: string,
  amount: number
): Promise<string | null> {
  if (!walletAddress || amount <= 0) {
    return null;
  }

  try {
    // 1. Create a JettonMinter wrapper
    // @ts-expect-error - JettonMinter
    const minter = new JettonMinter(tonweb.provider, {
      address: new TonWebAddress(JETTON_MASTER),
    });

    console.log("minter", minter);

    // 2. Get the user's Jetton-wallet address
    const jettonWalletAddr = await minter.getJettonWalletAddress(
      new TonWebAddress(walletAddress)
    );

    console.log("jettonWalletAddr", jettonWalletAddr);

    // 3. Create a JettonWallet wrapper for the user's wallet
    const jettonWallet = new JettonWallet(tonweb.provider, {
      address: jettonWalletAddr,
    });

    console.log("jettonWallet", jettonWallet);

    // 4. Calculate the amount to burn (in nanojettons)
    const amountToburn = amount * 10 ** 9; // Convert to nano units

    // 5. Create a burn transaction
    const burnParams = {
      tokenAmount: new TonWeb.utils.BN(amountToburn),
      responseAddress: new TonWebAddress(walletAddress),
    };
    console.log("burnParams", burnParams);

    // 6. Generate the cell payload for the burn
    const burnBody = await jettonWallet.createBurnBody(burnParams);
    console.log("burnBody", burnBody);
    // 7. Create a transaction message
    const txData = {
      to: jettonWalletAddr,
      amount: TonWeb.utils.toNano("0.05"), // Standard fee for burn
      payload: burnBody,
    };
    console.log("txData", txData);
    // 8. Request wallet to send the transaction
    // We need to use the TonConnect protocol for this
    const { tonConnectUI } = useTonConnectUI();

    console.log("tonConnectUI", tonConnectUI);

    if (!tonConnectUI.connected) {
      throw new Error("Wallet not connected");
    }

    // 9. Send the transaction
    // Convert the burn body to base64 string for the payload
    // Get cell serialized bytes for TonConnect
    const serializedBytes = await burnBody.toBoc();

    console.log("serializedBytes", serializedBytes);

    const result = await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 360, // 5 minutes
      messages: [
        {
          address: txData.to.toString(),
          amount: txData.amount.toString(),
          payload: TonWeb.utils.bytesToBase64(serializedBytes),
        },
      ],
    });

    // Return transaction hash if successful
    return result.boc;
  } catch (e) {
    console.error("Error burning jettons:", e);
    return null;
  }
}
