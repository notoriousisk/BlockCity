import { onMounted, onUnmounted, readonly, shallowRef } from "vue";
import type {
  ConnectedWallet,
  Wallet,
  WalletInfoWithOpenMethod,
} from "@tonconnect/ui";
import { useTonConnectUI } from "./useTonConnectUI";
import { updateWalletAddress } from "@/firebase/firebaseService";
import { initData, useSignal } from "@telegram-apps/sdk-vue";

export function useTonWallet() {
  const wallet = shallowRef<
    Wallet | (Wallet & WalletInfoWithOpenMethod) | null
  >(null);
  const { tonConnectUI } = useTonConnectUI();
  const initDataRef = useSignal(initData.state);

  onMounted(() => {
    if (tonConnectUI) {
      wallet.value = tonConnectUI.wallet;
      const unsubscribe = tonConnectUI.onStatusChange(
        (value: ConnectedWallet | null) => {
          wallet.value = value;

          // Store wallet address in the database when connected
          if (value && value.account && value.account.address) {
            const telegramId = initDataRef.value?.user?.id?.toString();
            if (telegramId) {
              updateWalletAddress(telegramId, value.account.address);
            }
          }
        }
      );
      onUnmounted(() => {
        unsubscribe();
      });
    }
  });

  return { wallet: readonly(wallet) };
}
