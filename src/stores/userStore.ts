import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { initData, useSignal, type User } from "@telegram-apps/sdk-vue";
import { type DisplayDataRow } from "@/components/AppDisplayData.vue";

export const useUserStore = defineStore("user", () => {
  // State
  const balance = ref(0);
  const energy = ref(100); // Default energy value
  const assets = ref({
    moves: 0,
  });
  const initDataRef = useSignal(initData.state);

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
    return user.value ? `https://t.me/your_bot?start=${user.value.id}` : "";
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
  // Actions
  const updateBalance = (newBalance: number) => {
    balance.value = newBalance;
  };

  const updateEnergy = (newEnergy: number) => {
    energy.value = Math.max(0, Math.min(100, newEnergy)); // Clamp between 0 and 100
  };

  const updateAssets = (newAssets: { moves: number }) => {
    assets.value = newAssets;
  };

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
    // Computed
    user,
    userRows,
    userPhotoUrl,
    userName,
    userUsername,
    referralCode,
    // Actions
    updateBalance,
    updateEnergy,
    updateAssets,
    copyReferralLink,
  };
});
