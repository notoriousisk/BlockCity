<template>
  <AppPage title="Profile">
    <div v-if="!userRows" class="error-message">
      Application was launched with missing init data
    </div>
    <template v-else>
      <!-- User Profile Block -->
      <div class="profile-block">
        <div class="profile-header">
          <div class="profile-photo-container">
            <img
              v-if="userPhotoUrl"
              :src="userPhotoUrl"
              alt="Profile"
              class="profile-photo"
            />
            <User v-else class="profile-icon" />
          </div>
          <div class="profile-info">
            <div class="name-container">
              <h2 class="profile-name">{{ userName }}</h2>
              <Star v-if="user?.isPremium" class="premium-star" />
            </div>
            <div class="username-container">
              <p class="profile-username" v-if="userUsername">
                @{{ userUsername }}
              </p>
              <span v-if="user?.isPremium" class="premium-badge">Premium</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Balance Block -->
      <div class="balance-block">
        <h3>Resources</h3>
        <div class="resources-container">
          <div class="resource-item">
            <div class="resource-header">
              <BadgeDollarSign class="resource-icon" />
              <span class="resource-label">Balance</span>
            </div>
            <span class="resource-value">{{ Math.floor(balance) }} $</span>
          </div>
          <div class="resource-item">
            <div class="resource-header">
              <Zap class="resource-icon" />
              <span class="resource-label">Energy</span>
            </div>
            <span class="resource-value">{{ energy }}/100</span>
          </div>
        </div>
      </div>

      <!-- Assets Block -->
      <div class="assets-block">
        <h3>Assets</h3>
        <div class="asset-item">
          <div class="asset-header">
            <BringToFront class="asset-icon" />
            <span class="asset-name">Hints for 60 sec</span>
          </div>
          <span class="asset-amount">{{ assets.showAvailableMoves }}</span>
        </div>
        <div class="asset-item">
          <div class="asset-header">
            <Bot class="asset-icon" />
            <span class="asset-name">AI Assistant for 60 sec</span>
          </div>
          <span class="asset-amount">{{ assets.aiAssistant }}</span>
        </div>
        <button @click="navigateToShop" class="shop-button">
          <ShoppingCart class="shop-icon" />
          Shop
        </button>
      </div>

      <!-- Referral Block -->
      <div class="referral-block">
        <h3>Referral Link</h3>
        <div class="referral-multiplier">
          <div class="multiplier-label">Current Referral Multiplier:</div>
          <div class="multiplier-value">{{ referralMultiplier }}x</div>
        </div>
        <div class="referral-link-container">
          <input
            type="text"
            :value="referralCode"
            readonly
            class="referral-input"
          />
          <button
            @click="handleCopyReferral"
            class="copy-button"
            :class="{ copied: isCopied }"
          >
            {{ isCopied ? "Copied!" : "Copy" }}
          </button>
        </div>
      </div>

      <!-- TON Connect Button -->
      <div class="ton-connect-section">
        <div v-if="walletExtended" class="wallet-info">
          <img
            class="wallet-image"
            :src="walletExtended.imageUrl"
            alt="Wallet logo"
            width="40"
            height="40"
          />
          <div class="wallet-meta">
            <p class="wallet-name">
              {{ walletExtended.name }}&nbsp;
              <span class="wallet-app-name">{{ walletExtended.appName }}</span>
            </p>
            <p class="wallet-address">{{ wallet?.account.address }}</p>
          </div>
        </div>
        <div class="ton-connect-button-container">
          <TonConnectButton />
        </div>
      </div>
    </template>
  </AppPage>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

import {
  BadgeDollarSign,
  Zap,
  BringToFront,
  User,
  Star,
  Bot,
  ShoppingCart,
} from "lucide-vue-next";

import AppPage from "@/components/AppPage.vue";
import { useUserStore } from "@/stores/userStore";
import { TonConnectButton, useTonWallet } from "@/tonconnect";
import { useNavbarStore } from "@/stores/navbarStore";

const isCopied = ref(false);
const { wallet } = useTonWallet();

// Destructure values from userStore
const userStore = useUserStore();
const {
  userRows,
  userPhotoUrl,
  userName,
  user,
  userUsername,
  balance,
  energy,
  assets,
  referralMultiplier,
  referralCode,
} = storeToRefs(userStore);

const { copyReferralLink } = userStore;
const navbarStore = useNavbarStore();
const { setActiveTab } = navbarStore;

const walletExtended = computed(() => {
  return wallet.value && "imageUrl" in wallet.value ? wallet.value : null;
});

// Handlers
const handleCopyReferral = async () => {
  await copyReferralLink();
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000); // Reset after 2 seconds
};

const navigateToShop = () => {
  setActiveTab("shop");
};
</script>

<style scoped>
.profile-block {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px var(--color-card-shadow);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-photo-container {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid var(--color-primary-light);
  box-shadow: 0 2px 4px var(--color-card-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-light);
  overflow: hidden;
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-secondary);
  stroke-width: 1.5;
}

.profile-info {
  flex: 1;
}

.name-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-name {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.profile-username {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.premium-star {
  width: 24px;
  height: 24px;
  color: var(--color-accent);
  stroke-width: 2;
  filter: drop-shadow(0 0 4px var(--color-accent));
  animation: glow 2s ease-in-out infinite;
}

.premium-badge {
  background-color: var(--color-accent-light);
  color: var(--color-accent);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

@keyframes glow {
  0%,
  100% {
    filter: drop-shadow(0 0 4px var(--color-accent));
  }
  50% {
    filter: drop-shadow(0 0 8px var(--color-accent));
  }
}

.balance-block,
.assets-block,
.referral-block {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px var(--color-card-shadow);
}

h3 {
  margin: 0 0 16px;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.resources-container {
  display: flex;
  gap: 24px;
}

.resource-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: var(--color-light);
  border-radius: 12px;
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-icon {
  width: 1.5rem;
  height: 1.5rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
  stroke-width: 2.5;
}

.resource-label {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
}

.resource-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.resource-item:nth-child(1) .resource-value {
  color: var(--color-balance);
}

.resource-item:nth-child(2) .resource-value {
  color: var(--color-energy);
}

.resource-item:nth-child(1) .resource-icon {
  color: var(--color-balance);
}

.resource-item:nth-child(2) .resource-icon {
  color: var(--color-energy);
}

.asset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--color-light);
  border-radius: 12px;
  margin-bottom: 8px;
}

.asset-item:last-child {
  margin-bottom: 0;
}

.asset-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-name {
  color: var(--color-text-primary);
  font-weight: 500;
}

.asset-amount {
  font-weight: 700;
  color: var(--color-asset);
}

.asset-icon {
  color: var(--color-asset);
}

.referral-multiplier {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--color-light);
  border-radius: 12px;
  margin-bottom: 16px;
}

.multiplier-label {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
}

.multiplier-value {
  font-weight: 700;
  color: var(--color-accent);
  font-size: 1.25rem;
}

.referral-link-container {
  display: flex;
  gap: 12px;
}

.referral-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-light);
  color: var(--color-text-primary);
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.referral-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.copy-button {
  padding: 12px 20px;
  background-color: var(--color-button-primary);
  color: var(--color-button-text);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.copy-button:hover {
  background-color: var(--color-button-primary-hover);
}

.copy-button.copied {
  background-color: var(--color-success);
}

.ton-connect-section {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 2px 4px var(--color-card-shadow);
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background-color: var(--color-light);
  border-radius: 12px;
}

.wallet-image {
  border-radius: 8px;
}

.wallet-meta {
  flex: 1;
}

.wallet-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
  color: var(--color-text-primary);
}

.wallet-app-name {
  opacity: 0.6;
  font-weight: 400;
  font-size: 0.9rem;
}

.wallet-address {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  word-break: break-all;
}

.ton-connect-button-container {
  display: flex;
  justify-content: center;
}

.error-message {
  color: var(--color-text-secondary);
  text-align: center;
  padding: 24px;
  background-color: var(--color-light);
  border-radius: 12px;
  font-size: 1.1rem;
}

.shop-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background-color: var(--color-button-primary);
  color: var(--color-button-text);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}

.shop-button:hover {
  background-color: var(--color-button-primary-hover);
}

.shop-icon {
  width: 20px;
  height: 20px;
}
</style>
