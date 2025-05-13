<template>
  <AppPage title="Profile">
    <template #header>
      <div class="user-header">PROFILE</div>
    </template>
    <div v-if="!userRows" class="error-message">
      Application was launched with missing init data
    </div>
    <template v-else>
      <!-- Profile Card -->
      <div class="profile-card">
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
      <!-- Resource Bar -->
      <div class="resource-bar">
        <div class="resource-card">
          <img src="@/assets/coin.png" class="resource-bar-icon" alt="Coin" />
          <span class="resource-bar-value">{{ Math.floor(balance) }}</span>
        </div>
        <div class="resource-card">
          <img
            src="@/assets/lightning.png"
            class="resource-bar-icon"
            alt="Lightning"
          />
          <span class="resource-bar-value">{{ energy }}/100</span>
        </div>
      </div>
      <!-- Assets Card -->
      <div class="user-card">
        <div class="user-card-title">Boosts</div>
        <div class="asset-list">
          <div class="asset-item">
            <div class="asset-icon-bg">
              <img src="@/assets/smart.png" alt="Smart" />
            </div>
            <div class="asset-info">
              <div class="asset-name">Hints for 60 sec</div>
              <div class="asset-amount">x{{ assets.showAvailableMoves }}</div>
            </div>
          </div>
          <div class="asset-item">
            <div class="asset-icon-bg">
              <img src="@/assets/robot.png" alt="Robot" />
            </div>
            <div class="asset-info">
              <div class="asset-name">AI Assistant for 60 sec</div>
              <div class="asset-amount">x{{ assets.aiAssistant }}</div>
            </div>
          </div>
        </div>
        <button @click="navigateToShop" class="shop-button">
          <img src="@/assets/coin.png" class="shop-icon" alt="Shop" />
          Shop
        </button>
      </div>

      <!-- Referral Card -->
      <div class="user-card">
        <div class="user-card-title">Referral Link</div>
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
      <div class="user-card">
        <div class="user-card-title">Wallet</div>
        <div v-if="walletExtended" class="wallet-info">
          <div class="wallet-balance-container">
            <div v-if="wallet" class="wallet-balance-display">
              <div v-if="isBalanceLoading" class="balance-loading">
                Loading balance...
              </div>
              <div v-else-if="hasError" class="balance-error">
                <AlertCircle :size="18" />
                {{ errorMessage || "Error loading balance" }}
              </div>
              <div v-else class="balance-amount">
                {{ formattedBalance }}
                <button
                  @click="fetchBalance"
                  class="refresh-button"
                  :class="{ refreshing: isBalanceLoading }"
                >
                  <RefreshCw :size="16" />
                </button>
              </div>
            </div>

            <div v-if="wallet" class="wallet-jetton-display">
              <div v-if="isJettonLoading" class="balance-loading">
                Loading jettons...
              </div>
              <div v-else-if="hasJettonError" class="balance-error">
                <AlertCircle :size="18" />
                {{ jettonErrorMessage || "Error loading jettons" }}
              </div>
              <div v-else class="jetton-balance-amount">
                {{ formattedJettonBalance }}
                <button
                  @click="fetchJettonBalance"
                  class="refresh-button"
                  :class="{ refreshing: isJettonLoading }"
                >
                  <RefreshCw :size="16" />
                </button>
              </div>
            </div>
          </div>

          <div class="wallet-details">
            <img
              class="wallet-image"
              :src="walletExtended.imageUrl"
              alt="Wallet logo"
              width="24"
              height="24"
            />
            <div class="wallet-meta">
              <p class="wallet-name">
                {{ walletExtended.name }}&nbsp;
                <span class="wallet-app-name">{{
                  walletExtended.appName
                }}</span>
              </p>
              <p class="wallet-address">{{ wallet?.account.address }}</p>
            </div>
          </div>
        </div>
        <div v-else-if="walletAddress && !wallet" class="wallet-info">
          <div class="wallet-meta">
            <p class="wallet-name">Your wallet</p>
            <p class="wallet-address">{{ walletAddress }}</p>
            <p class="wallet-status-reconnecting">Reconnecting...</p>
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
import { User, Star, RefreshCw, AlertCircle } from "lucide-vue-next";
import AppPage from "@/components/AppPage.vue";
import { useUserStore } from "@/stores/userStore";
import { TonConnectButton, useTonWallet, useTonBalance } from "@/tonconnect";
import { useNavbarStore } from "@/stores/navbarStore";

const isCopied = ref(false);
const { wallet } = useTonWallet();
const {
  formattedBalance,
  isLoading: isBalanceLoading,
  fetchBalance,
  hasError,
  errorMessage,

  formattedJettonBalance,
  isJettonLoading,
  fetchJettonBalance,
  hasJettonError,
  jettonErrorMessage,
} = useTonBalance();

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
  walletAddress,
} = storeToRefs(userStore);

const { copyReferralLink } = userStore;
const navbarStore = useNavbarStore();
const { setActiveTab } = navbarStore;

const walletExtended = computed(() => {
  return wallet.value && "imageUrl" in wallet.value ? wallet.value : null;
});

const handleCopyReferral = async () => {
  await copyReferralLink();
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 2000);
};

const navigateToShop = () => {
  setActiveTab("shop");
};
</script>

<style scoped>
.user-header {
  width: 100vw;
  max-width: 100%;
  background: var(--color-primary);
  color: var(--color-button-text);
  font-size: 2.2rem;
  font-weight: 800;
  text-align: center;
  padding: 0 0 18px 0;
  letter-spacing: 0.04em;
  box-shadow: 0 2px 8px var(--color-card-shadow);
  margin-bottom: 18px;
}
.resource-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 32px 0;
}
.resource-card {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-card-bg);
  border-radius: 16px;
  box-shadow: 0 1px 4px var(--color-card-shadow);
  padding: 18px 24px;
  font-weight: 600;
  font-size: 1.25rem;
  gap: 12px;
  border: 1.5px solid var(--color-card-border);
}
.resource-bar-icon {
  width: 32px;
  height: 32px;
}
.resource-bar-value {
  font-size: 1.3rem;
  color: var(--color-text-primary);
}
.profile-card {
  background: var(--color-card-bg);
  border-radius: 20px;
  box-shadow: 0 1px 4px var(--color-card-shadow);
  padding: 24px 20px;
  margin-bottom: 20px;
  border: 1.5px solid var(--color-card-border);
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
.user-card {
  background: var(--color-card-bg);
  border-radius: 20px;
  box-shadow: 0 1px 4px var(--color-card-shadow);
  padding: 24px 20px;
  margin-bottom: 20px;
  border: 1.5px solid var(--color-card-border);
}
.user-card-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}
.asset-list {
  display: flex;
  gap: 18px;
  margin-bottom: 12px;
}
.asset-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-light);
  border-radius: 14px;
  padding: 12px 18px;
  flex: 1;
}
.asset-icon-bg {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--color-primary-light);
}
.asset-icon-bg img {
  width: 24px;
  height: 24px;
}
.asset-info {
  flex: 1;
}
.asset-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 1.05rem;
}
.asset-amount {
  font-weight: 700;
  color: var(--color-asset);
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
.ton-connect-button-container {
  display: flex;
  justify-content: center;
}
.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background-color: var(--color-light);
  border-radius: 12px;
}
.wallet-balance-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.wallet-balance-display,
.wallet-jetton-display {
  width: 100%;
}
.balance-amount,
.jetton-balance-amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.balance-loading {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  font-style: italic;
}
.balance-error {
  color: #f44336;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
}
.wallet-details {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}
.wallet-image {
  border-radius: 6px;
}
.wallet-meta {
  flex: 1;
  min-width: 0;
  width: 100%;
}
.wallet-name {
  font-weight: 500;
  font-size: 0.9rem;
  margin: 0;
  color: var(--color-text-secondary);
}
.wallet-app-name {
  opacity: 0.6;
  font-weight: 400;
  font-size: 0.8rem;
}
.wallet-address {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: 100%;
  display: block;
}
.refresh-button {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.refresh-button:hover {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
.refresh-button.refreshing {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.wallet-status-reconnecting {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--color-accent);
  font-style: italic;
}
.error-message {
  color: var(--color-text-secondary);
  text-align: center;
  padding: 24px;
  background-color: var(--color-light);
  border-radius: 12px;
  font-size: 1.1rem;
}
</style>
