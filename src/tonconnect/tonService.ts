import { TonClient } from "@ton/ton";
import { Address } from "@ton/core";
import { useTonWallet } from "./useTonWallet";
import { ref, computed, watch } from "vue";

// Create a TON client with a public endpoint
let tonClient: TonClient;

try {
  tonClient = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
  });
} catch (error) {
  console.error("Failed to initialize TON client:", error);
}

// Create a shared reactive state for TON balance
const tonBalance = ref<string>("0");
const isBalanceLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref("");

/**
 * Get TON balance for the connected wallet
 * @returns A reactive object with balance information
 */
export function useTonBalance() {
  const { wallet } = useTonWallet();

  // Formatted balance with TON symbol
  const formattedBalance = computed(() => {
    return `${tonBalance.value} TON`;
  });

  /**
   * Manually fetch wallet balance
   */
  const fetchWalletBalance = async () => {
    // Reset error state
    hasError.value = false;
    errorMessage.value = "";

    if (!wallet.value || !wallet.value.account.address) {
      tonBalance.value = "0";
      return;
    }

    if (!tonClient) {
      hasError.value = true;
      errorMessage.value = "TON client not initialized";
      return;
    }

    try {
      isBalanceLoading.value = true;

      // Get raw balance in nanoTON
      const rawBalance = await tonClient.getBalance(
        Address.parse(wallet.value.account.address)
      );

      // Convert from nanoTON to TON (1 TON = 10^9 nanoTON)
      const balanceInTon = Number(rawBalance) / 10 ** 9;

      // Format to a maximum of 4 decimal places
      tonBalance.value = balanceInTon.toFixed(4);
    } catch (error) {
      console.error("Error fetching TON balance:", error);
      hasError.value = true;
      errorMessage.value = "Failed to fetch balance";
      tonBalance.value = "0";
    } finally {
      isBalanceLoading.value = false;
    }
  };

  // Fetch balance when wallet changes
  watch(
    wallet,
    async () => {
      await fetchWalletBalance();
    },
    { immediate: true }
  );

  return {
    balance: tonBalance,
    formattedBalance,
    isLoading: isBalanceLoading,
    hasError,
    errorMessage,
    fetchBalance: fetchWalletBalance,
  };
}
