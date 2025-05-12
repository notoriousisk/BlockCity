import { ref, computed, onUnmounted, type Component } from "vue";
import { defineStore } from "pinia";
import { initData, useSignal, type User } from "@telegram-apps/sdk-vue";
import { openToast } from "@/stores/toast";

import type { UserDoc, Assets } from "@/types";

import {
  initUser,
  onUserDataChange,
  spendEnergy,
  completeLevel,
  purchaseAsset,
  spendAsset,
  refillEnergy,
} from "@/firebase/firebaseService";

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
  const currentLevelId = ref(1);
  const numberOfRefs = ref(0);
  const referralMultiplier = ref(1);

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
      ? `https://t.me/your_bot?start=${initDataRef.value.user.id}`
      : "";
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
    });

    // Start interval to refresh energy in real-time
    startEnergyRefreshInterval();
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

  async function spendAssetAction(
    assetType: "showAvailableMoves" | "aiAssistant"
  ) {
    if (!userDoc.value) return false;
    const success = await spendAsset(userDoc.value.telegramId, assetType);
    if (success) {
      openToast({
        title: "Boost",
        content: ` ${
          assetType === "showAvailableMoves" ? "Hints" : "AI Assistant"
        } activated`,
        type: "warning",
      });
    } else {
      openToast({
        title: "Use Failed",
        content: "You don't have this asset available",
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
    currentLevelId,
    numberOfRefs,
    referralMultiplier,
    // Computed
    user,
    userRows,
    userPhotoUrl,
    userName,
    userUsername,
    referralCode,
    // actions
    init,
    spendEnergyAction,
    refillEnergyAction,
    purchaseAssetAction,
    spendAssetAction,
    completeLevelAction,
    copyReferralLink,
    startEnergyRefreshInterval,
    stopEnergyRefreshInterval,
  };
});
