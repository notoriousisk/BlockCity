import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { initData, useSignal, type User } from "@telegram-apps/sdk-vue";
import { type DisplayDataRow } from "@/components/AppDisplayData.vue";

import type { UserDoc, Assets } from "@/types";

import {
  initUser,
  onUserDataChange,
  spendEnergy,
  completeLevel,
} from "@/firebase/firebaseService";

export const useUserStore = defineStore("user", () => {
  const userDoc = ref<UserDoc | null>(null);
  const unsub = ref<() => void>();

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
  }
  // Actions
  async function spendEnergyAction(cost: number) {
    if (!userDoc.value) return;
    await spendEnergy(userDoc.value.telegramId, cost);
  }

  async function completeLevelAction(levelConfig: {
    id: number;
    reward: number;
  }) {
    if (!userDoc.value) return;
    await completeLevel(userDoc.value.telegramId, levelConfig.id, levelConfig.reward);
  }

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralCode.value);
      return true;
    } catch (err) {
      console.error("Failed to copy referral link:", err);
      return false;
    }
  };

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
    completeLevelAction,
    copyReferralLink,
  };
});
