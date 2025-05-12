<template>
  <AppPage title="Shop">
    <!-- Resources Display -->
    <div class="shop-section">
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

    <div class="shop-container">
      <!-- Energy Refill Section -->
      <div class="shop-section">
        <h3>Energy</h3>
        <div class="shop-item">
          <div class="item-info">
            <div class="item-header">
              <Zap class="item-icon" />
              <span class="item-name">Refill Energy</span>
            </div>
            <div class="item-description">
              Refill your energy to maximum (100)
            </div>
          </div>
          <div class="item-actions">
            <div class="item-price">
              <BadgeDollarSign class="price-icon" />
              <span>{{ energyRefillCost }}$</span>
            </div>
            <button
              @click="handleRefillEnergy"
              class="purchase-button"
              :disabled="!canRefillEnergy"
              :class="{ disabled: !canRefillEnergy }"
            >
              Refill
            </button>
          </div>
        </div>
      </div>

      <!-- Assets Section -->
      <div class="shop-section">
        <h3>Assets</h3>
        <div class="shop-item">
          <div class="item-info">
            <div class="item-header">
              <BringToFront class="item-icon" />
              <span class="item-name">Hints for 60 sec</span>
            </div>
            <div class="item-description">
              Shows all available moves for 60 seconds
            </div>
          </div>
          <div class="item-actions">
            <div class="item-price">
              <BadgeDollarSign class="price-icon" />
              <span>200$</span>
            </div>
            <button
              @click="handlePurchaseAsset('showAvailableMoves')"
              class="purchase-button"
              :disabled="!canPurchaseAsset('showAvailableMoves')"
              :class="{ disabled: !canPurchaseAsset('showAvailableMoves') }"
            >
              Purchase
            </button>
          </div>
        </div>

        <div class="shop-item">
          <div class="item-info">
            <div class="item-header">
              <Bot class="item-icon" />
              <span class="item-name">AI Assistant for 60 sec</span>
            </div>
            <div class="item-description">Get AI assistance for 60 seconds</div>
          </div>
          <div class="item-actions">
            <div class="item-price">
              <BadgeDollarSign class="price-icon" />
              <span>600$</span>
            </div>
            <button
              @click="handlePurchaseAsset('aiAssistant')"
              class="purchase-button"
              :disabled="!canPurchaseAsset('aiAssistant')"
              :class="{ disabled: !canPurchaseAsset('aiAssistant') }"
            >
              Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { BadgeDollarSign, Zap, BringToFront, Bot } from "lucide-vue-next";

import AppPage from "@/components/AppPage.vue";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const { balance, energy } = storeToRefs(userStore);
const { refillEnergyAction, purchaseAssetAction } = userStore;

// Calculate energy refill cost
const energyRefillCost = computed(() => {
  const energyNeeded = 100 - energy.value;
  return energyNeeded * 3; // $3 per energy
});

// Check if energy can be refilled
const canRefillEnergy = computed(() => {
  return energy.value < 100 && balance.value >= energyRefillCost.value;
});

// Check if asset can be purchased
const canPurchaseAsset = (assetType: "showAvailableMoves" | "aiAssistant") => {
  const costs = {
    showAvailableMoves: 200,
    aiAssistant: 600,
  };
  return balance.value >= costs[assetType];
};

// Handlers
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
.shop-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.shop-section {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 16px;
  padding: 24px;
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

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--color-light);
  border-radius: 12px;
  margin-bottom: 12px;
}

.shop-item:last-child {
  margin-bottom: 0;
}

.item-info {
  flex: 1;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.item-icon {
  width: 24px;
  height: 24px;
  color: var(--color-asset);
}

.item-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

.item-description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--color-balance);
}

.price-icon {
  width: 16px;
  height: 16px;
}

.purchase-button {
  padding: 8px 20px;
  background-color: var(--color-button-primary);
  color: var(--color-button-text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.purchase-button:hover:not(.disabled) {
  background-color: var(--color-button-primary-hover);
}

.purchase-button.disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
