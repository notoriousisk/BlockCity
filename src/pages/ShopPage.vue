<template>
  <AppPage title="Shop">
    <template #header>
      <div class="shop-header">SHOP</div>
    </template>
    <!-- Top Resource Bar -->
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

    <!-- Shop Items -->
    <div class="shop-list">
      <!-- Refill Energy -->
      <div class="shop-card" :class="{ pulsate: energy < 10 }">
        <div class="shop-card-icon shop-card-icon-bg">
          <img src="@/assets/battery.png" alt="Battery" />
        </div>
        <div class="shop-card-content">
          <div class="shop-card-title">Refill Energy</div>
          <div class="shop-card-desc">Refill your energy to maximum (100)</div>
        </div>
        <div class="shop-card-action">
          <div class="shop-card-price">
            <img
              src="@/assets/coin.png"
              class="shop-card-price-icon"
              alt="Coin"
            />
            <span>{{ energyRefillCost }}</span>
          </div>
          <button
            class="shop-card-btn"
            :disabled="!canRefillEnergy"
            @click="handleRefillEnergy"
          >
            Refill
          </button>
        </div>
      </div>

      <!-- Hints for 60 sec -->
      <div class="shop-card">
        <div class="shop-card-icon shop-card-icon-bg">
          <img src="@/assets/smart.png" alt="Smart" />
        </div>
        <div class="shop-card-content">
          <div class="shop-card-title">Hints for 60 sec</div>
          <div class="shop-card-desc">
            Shows all available moves for 60 seconds
          </div>
        </div>
        <div class="shop-card-action">
          <div class="shop-card-price">
            <img
              src="@/assets/coin.png"
              class="shop-card-price-icon"
              alt="Coin"
            />
            <span>{{ ASSET_COSTS.showAvailableMoves }}</span>
          </div>
          <button
            class="shop-card-btn"
            :disabled="!canPurchaseAsset('showAvailableMoves')"
            @click="handlePurchaseAsset('showAvailableMoves')"
          >
            Purchase
          </button>
        </div>
      </div>

      <!-- AI Assistant for 60 sec -->
      <div class="shop-card">
        <div class="shop-card-icon shop-card-icon-bg">
          <img src="@/assets/robot.png" alt="Robot" />
        </div>
        <div class="shop-card-content">
          <div class="shop-card-title">AI Assistant for 60 sec</div>
          <div class="shop-card-desc">Get AI assistance for 60 seconds</div>
        </div>
        <div class="shop-card-action">
          <div class="shop-card-price">
            <img
              src="@/assets/coin.png"
              class="shop-card-price-icon"
              alt="Coin"
            />
            <span>{{ ASSET_COSTS.aiAssistant }}</span>
          </div>
          <button
            class="shop-card-btn"
            :disabled="!canPurchaseAsset('aiAssistant')"
            @click="handlePurchaseAsset('aiAssistant')"
          >
            Purchase
          </button>
        </div>
      </div>

      <!-- Exchange BCJ Jettons -->
      <div class="exchange-shop-card">
        <div class="shop-card-title">Exchange BCJ Jettons</div>

        <div class="exchange-container">
          <div class="circle-icon jetton-circle">
            <span class="bcj-symbol">BCJ</span>
          </div>

          <button
            class="exchange-button"
            :disabled="!isWalletConnected"
            @click="burnJettonsForCoins"
          >
            <RefreshCw :size="20" />
            <span>Exchange</span>
          </button>

          <div class="circle-icon coin-circle">
            <img src="@/assets/coin.png" alt="Coin" />
          </div>
        </div>

        <div class="shop-card-desc">
          Convert 1000 BCJ tokens to 1000 game coins
        </div>
      </div>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import AppPage from "@/components/AppPage.vue";
import { useUserStore } from "@/stores/userStore";
import { ASSET_COSTS } from "@/types";
import { useTonWallet } from "@/tonconnect/useTonWallet";
import { RefreshCw } from "lucide-vue-next";

const userStore = useUserStore();
const { balance, energy } = storeToRefs(userStore);
const { refillEnergyAction, purchaseAssetAction, burnJettonsForCoins } =
  userStore;

// Wallet connection status
const { wallet } = useTonWallet();
const isWalletConnected = computed(() => !!wallet.value);

const energyRefillCost = computed(() => {
  const energyNeeded = 100 - energy.value;
  return energyNeeded * 3;
});

const canRefillEnergy = computed(() => {
  return energy.value < 100 && balance.value >= energyRefillCost.value;
});

const canPurchaseAsset = (assetType: "showAvailableMoves" | "aiAssistant") => {
  return balance.value >= ASSET_COSTS[assetType];
};

const handleRefillEnergy = async () => {
  if (!canRefillEnergy.value) return;
  await refillEnergyAction();
};

const handlePurchaseAsset = async (
  assetType: "showAvailableMoves" | "aiAssistant"
) => {
  if (!canPurchaseAsset(assetType)) return;
  await purchaseAssetAction(assetType);
};
</script>

<style scoped>
.shop-header {
  display: flex;
  justify-content: center;
  width: 100%;
  background: var(--color-primary);
  color: var(--color-button-text);
  font-size: 2.2rem;
  font-weight: 800;
  text-align: center;
  padding: 0 0 18px 0;
  letter-spacing: 0.04em;
  box-shadow: 0 2px 8px var(--color-card-shadow);
}

.resource-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 32px 0;
  width: 100%;
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

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  align-items: center;
}
.shop-card {
  display: flex;
  align-items: center;
  background: var(--color-card-bg);
  border-radius: 20px;
  box-shadow: 0 1px 4px var(--color-card-shadow);
  padding: 24px 20px;
  gap: 18px;
  border: 1.5px solid var(--color-card-border);
  width: 100%;
}

.exchange-shop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-card-bg);
  border-radius: 20px;
  box-shadow: 0 1px 4px var(--color-card-shadow);
  padding: 24px 20px;
  gap: 18px;
  width: 100%;
  border: 1.5px solid var(--color-card-border);
}
.shop-card-icon {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: var(--color-primary-light);
}
.shop-card-icon-bg img {
  width: 36px;
  height: 36px;
  display: block;
}
.shop-card-content {
  flex: 1;
  min-width: 0;
}
.shop-card-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--color-text-primary);
}
.shop-card-desc {
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 400;
}
.shop-card-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 90px;
}
.shop-card-price {
  display: flex;
  align-items: center;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-balance);
  gap: 4px;
}
.shop-card-price-icon {
  width: 22px;
  height: 22px;
}
.shop-card-btn {
  background: var(--color-button-primary);
  color: var(--color-button-text);
  border: none;
  border-radius: 10px;
  padding: 8px 22px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s;
}
.shop-card-btn:disabled {
  background: var(--color-button-primary-hover);
  color: var(--color-button-text);
  cursor: not-allowed;
}
.pulsate {
  animation: pulsate 1.2s infinite;
  box-shadow: 0 0 0 0 var(--color-primary-light),
    0 1px 4px var(--color-card-shadow);
}

.jetton-label {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-balance);
}

.jetton-icon {
  background: linear-gradient(135deg, #6366f1, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bcj-symbol {
  color: white;
  font-weight: 700;
  font-size: 2rem;
}
.exchange-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.circle-icon {
  width: 80px;
  height: 80px;
  min-width: 80px;
  min-height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.jetton-circle {
  background: linear-gradient(135deg, #6366f1, #3b82f6);
}

.coin-circle {
  background: var(--color-accent-light);
}

.coin-circle img {
  width: 72px;
  height: 72px;
}

.exchange-button {
  background: var(--color-button-primary);
  color: var(--color-button-text);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.exchange-button:hover:not(:disabled) {
  background-color: var(--color-button-primary-hover);
}

.exchange-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulsate {
  0% {
    box-shadow: 0 0 0 0 var(--color-primary-light),
      0 1px 4px var(--color-card-shadow);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(59, 130, 246, 0.15),
      0 1px 4px var(--color-card-shadow);
  }
  100% {
    box-shadow: 0 0 0 0 var(--color-primary-light),
      0 1px 4px var(--color-card-shadow);
  }
}
</style>
