import { ref, computed, onUnmounted, type Component } from "vue";
import { defineStore } from "pinia";
import { initData, useSignal, type User } from "@telegram-apps/sdk-vue";
import { openToast } from "@/stores/toastStore";

import type { UserDoc, Assets, ActiveBoosts } from "@/types";

import {
  initUser,
  onUserDataChange,
  spendEnergy,
  completeLevel,
  purchaseAsset,
  refillEnergy,
  activateBoost,
  addCoinsFromJettonBurn,
} from "@/firebase/firebaseService";
import { useTonConnectUI } from "@/tonconnect/useTonConnectUI";
import { burnJettons } from "@/tonconnect/jettonOperations";

export interface DisplayDataRow {
  title: string;
  value?: string | number | boolean | Component;
}

export const useUserStore = defineStore("user", () => {
  const userDoc = ref<UserDoc | null>(null);
  const unsub = ref<(() => void) | undefined>();
  const energyRefreshInterval = ref<number | undefined>(undefined);

  const initDataRef = useSignal(initData.state);

  // State
  const balance = ref(0);
  const energy = ref(100); // Default energy value
  const assets = ref<Assets>({ showAvailableMoves: 0, aiAssistant: 0 });
  const activeBoosts = ref<ActiveBoosts>({});
  const currentLevelId = ref(1);
  const numberOfRefs = ref(0);
  const referralMultiplier = ref(1);
  const walletAddress = ref("");

  // Computed properties
  const user = computed(() => initDataRef.value?.user);
  const userRows = computed<DisplayDataRow[] | undefined>(() => {
    return user.value ? getUserRows(user.value) : undefined;
  });
  const userPhotoUrl = computed(() => user.value?.photoUrl || "");
  const userName = computed(() => {
    return user.value
      ? `${user.value.firstName} ${user.value.lastName || ""}`.trim()
      : "";
  });
  const userUsername = computed(() => user.value?.username || "");
  const referralCode = computed(() => {
    return initDataRef.value?.user
      ? `https://t.me/blockcity_bot/game?startapp=${initDataRef.value.user.id}`
      : "";
  });

  // Boost computed
  const now = ref(Date.now());
  setInterval(() => (now.value = Date.now()), 1000);
  const isShowMovesActive = computed(() => {
    const boost = activeBoosts.value?.showAvailableMoves;
    return boost && boost.expiresAt > now.value;
  });
  const isAiAssistantActive = computed(() => {
    const boost = activeBoosts.value?.aiAssistant;
    return boost && boost.expiresAt > now.value;
  });

  // Helper functions
  function getUserRows(user: User): DisplayDataRow[] {
    return [
      { title: "id", value: user.id.toString() },
      { title: "username", value: user.username },
      { title: "photo_url", value: user.photoUrl },
      { title: "last_name", value: user.lastName },
      { title: "first_name", value: user.firstName },
      { title: "is_bot", value: user.isBot },
      { title: "is_premium", value: user.isPremium },
      { title: "language_code", value: user.languageCode },
      { title: "allows_to_write_to_pm", value: user.allowsWriteToPm },
      { title: "added_to_attachment_menu", value: user.addedToAttachmentMenu },
    ];
  }

  async function init() {
    const td = initDataRef.value;
    if (!td?.user) return;
    const telegramId = td.user.id.toString();
    const refParam = td.startParam ?? null;

    await initUser(telegramId, refParam);
    // subscribe
    unsub.value = onUserDataChange(telegramId, (data) => {
      userDoc.value = data;
      balance.value = data.balance;
      energy.value = data.energy;
      assets.value = data.assets;
      currentLevelId.value = data.currentLevelId;
      numberOfRefs.value = data.numberOfRefs;
      referralMultiplier.value = data.referralMultiplier;
      activeBoosts.value = data.activeBoosts || {};
      walletAddress.value = data.walletAddress;

      // Restore wallet connection if we have a stored address
      if (data.walletAddress && !wasWalletRestoreAttempted.value) {
        restoreWalletConnection();
      }
    });

    // Start interval to refresh energy in real-time
    startEnergyRefreshInterval();
  }

  // Track if we've already tried to restore the wallet to avoid multiple attempts
  const wasWalletRestoreAttempted = ref(false);

  // Restore wallet connection from saved address
  async function restoreWalletConnection() {
    try {
      // Mark that we've attempted to restore
      wasWalletRestoreAttempted.value = true;

      if (!walletAddress.value) return;

      const { tonConnectUI } = useTonConnectUI();

      // Check if wallet is already connected
      if (tonConnectUI.wallet) return;

      // Attempt to reconnect to the last wallet
      // This will use the session that should still be stored in localStorage
      await tonConnectUI.openModal();

      openToast({
        title: "Wallet Connected",
        content: "Your TON wallet has been automatically connected",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to restore wallet connection:", err);
      // If there's an error, we'll just let the user connect manually
    }
  }

  // Start interval to update energy in real-time
  function startEnergyRefreshInterval() {
    // Clear existing interval if any
    if (energyRefreshInterval.value) {
      clearInterval(energyRefreshInterval.value);
    }

    // Set new interval to refresh energy every minute
    energyRefreshInterval.value = window.setInterval(() => {
      if (userDoc.value) {
        spendEnergyAction(0); // Call with 0 cost to just refresh the energy
      }
    }, 60000); // 60000ms = 1 minute
  }

  // Clean up interval when store is no longer used
  function stopEnergyRefreshInterval() {
    if (energyRefreshInterval.value) {
      clearInterval(energyRefreshInterval.value);
      energyRefreshInterval.value = undefined;
    }
  }

  // Actions
  async function spendEnergyAction(cost: number) {
    if (!userDoc.value) return;
    const newEnergy = await spendEnergy(userDoc.value.telegramId, cost);
    energy.value = newEnergy;
    if (cost > 0) {
      openToast({
        title: `-${cost} ⚡`,
        type: "warning",
        variant: "compact",
      });
    }
  }

  async function refillEnergyAction() {
    if (!userDoc.value) return false;
    const success = await refillEnergy(userDoc.value.telegramId);
    if (success) {
      openToast({
        title: "Energy Refilled",
        content: "Your energy has been refilled to maximum!",
        type: "success",
      });
    } else {
      openToast({
        title: "Refill Failed",
        content: "Not enough coins to refill energy",
        type: "error",
      });
    }
    return success;
  }

  async function purchaseAssetAction(
    assetType: "showAvailableMoves" | "aiAssistant"
  ) {
    if (!userDoc.value) return false;
    const success = await purchaseAsset(userDoc.value.telegramId, assetType);
    if (success) {
      openToast({
        title: "Asset Purchased",
        content: `You purchased ${
          assetType === "showAvailableMoves" ? "Hints" : "AI Assistant"
        }`,
        type: "success",
      });
    } else {
      openToast({
        title: "Purchase Failed",
        content: "Not enough coins to purchase this asset",
        type: "error",
      });
    }
    return success;
  }

  async function completeLevelAction(levelConfig: {
    id: number;
    reward: number;
  }) {
    if (!userDoc.value) return;
    await completeLevel(
      userDoc.value.telegramId,
      levelConfig.id,
      levelConfig.reward
    );
    openToast({
      title: `Level ${levelConfig.id} Complete!`,
      content: `You earned ${levelConfig.reward} coins!`,
      type: "success",
    });
  }

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralCode.value);
      openToast({
        title: "Copied!",
        type: "success",
      });
      return true;
    } catch (err) {
      console.error("Failed to copy referral link:", err);
      openToast({
        title: "Copy Failed",
        content: `Failed to copy referral link: ${err}`,
        type: "error",
      });
      return false;
    }
  };

  async function activateBoostAction(
    boostType: "showAvailableMoves" | "aiAssistant"
  ) {
    if (!userDoc.value) return false;
    const success = await activateBoost(userDoc.value.telegramId, boostType);
    if (success) {
      openToast({
        title:
          boostType === "showAvailableMoves"
            ? "Hints Activated"
            : "AI Assistant Activated",
        content: "Boost will be active for 60 seconds.",
        type: "success",
      });
    } else {
      openToast({
        title: "Activation Failed",
        content: "You don't have this asset available.",
        type: "error",
      });
    }
    return success;
  }

  /**
   * Burns 1000 jettons to receive 1000 coins
   * 1. Verifies user has a connected wallet
   * 2. Burns jettons on the TON blockchain
   * 3. Updates user balance in Firebase
   */
  async function burnJettonsForCoins() {
    if (!userDoc.value || !walletAddress.value) {
      openToast({
        title: "Wallet Not Connected",
        content: "Please connect your TON wallet first",
        type: "error",
      });
      return false;
    }

    // Amount constants
    const JETTONS_TO_BURN = "1000";
    const COINS_TO_RECEIVE = 1000;
    const JETTON_ADDRESS = import.meta.env.VITE_TON_JETTON_ADDRESS;

    try {
      // 1. Perform the blockchain transaction to burn jettons
      const result = await burnJettons(JETTON_ADDRESS, JETTONS_TO_BURN);

      if (!result) {
        openToast({
          title: "Transaction Failed",
          content: "Failed to exchange jettons burn. Please try again.",
          type: "error",
        });
        return false;
      }

      // 2. Add coins to user balance in Firebase
      const success = await addCoinsFromJettonBurn(
        userDoc.value.telegramId,
        COINS_TO_RECEIVE
      );

      if (success) {
        openToast({
          title: "Conversion Successful",
          content: `Exchanged ${JETTONS_TO_BURN} jettons for ${COINS_TO_RECEIVE} coins!`,
          type: "success",
        });
      } else {
        openToast({
          title: "Conversion Error",
          content: "Jettons were burned but failed to add coins to balance.",
          type: "error",
        });
      }

      return success;
    } catch (error) {
      console.error("Error in exchanging jettons for coins:", error);
      openToast({
        title: "Conversion Failed",
        content: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        type: "error",
      });
      return false;
    }
  }

  // Clean up on unmount
  onUnmounted(() => {
    if (unsub.value) {
      unsub.value();
    }
    stopEnergyRefreshInterval();
  });

  return {
    // State
    balance,
    energy,
    assets,
    activeBoosts,
    currentLevelId,
    numberOfRefs,
    referralMultiplier,
    walletAddress,
    // Computed
    user,
    userRows,
    userPhotoUrl,
    userName,
    userUsername,
    referralCode,
    isShowMovesActive,
    isAiAssistantActive,
    // actions
    init,
    spendEnergyAction,
    refillEnergyAction,
    purchaseAssetAction,
    completeLevelAction,
    copyReferralLink,
    activateBoostAction,
    startEnergyRefreshInterval,
    stopEnergyRefreshInterval,
    burnJettonsForCoins,
  };
});
