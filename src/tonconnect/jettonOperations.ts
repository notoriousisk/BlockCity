import { ref } from "vue";
import TonWeb from "tonweb";
import { useTonConnectUI } from "./useTonConnectUI";
import { useTonWallet } from "./useTonWallet";

// Initialize TonWeb
const tonweb = new TonWeb(
  new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", {
    apiKey: import.meta.env.VITE_TONCENTER_API_KEY,
  })
);

const { JettonMinter, JettonWallet } = TonWeb.token.jetton;
const { Address: TonWebAddress } = TonWeb.utils;

/**
 * Vue composable for using Jetton operations
 */
export const useJettonOperations = () => {
  const isProcessing = ref(false);
  const error = ref<string | null>(null);
  const { tonConnectUI } = useTonConnectUI();
  const { wallet } = useTonWallet();

  /**
   * Burns a specified amount of Jettons by transferring them to the zero address
   * @param jettonAddress - The address of the Jetton contract
   * @param amount - The amount of Jettons to burn
   */
  const burnJettons = async (jettonAddress: string, amount: string) => {
    if (!tonConnectUI) {
      throw new Error("TonConnectUI is not initialized");
    }

    if (!wallet.value?.account.address) {
      throw new Error("Wallet not connected");
    }

    try {
      isProcessing.value = true;
      error.value = null;

      // Create JettonMinter instance
      const minter = new JettonMinter(tonweb.provider, {
        address: new TonWebAddress(jettonAddress),
        adminAddress: new TonWebAddress(wallet.value.account.address),
        jettonContentUri: "",
        jettonWalletCodeHex: "",
      });

      // Get user's Jetton wallet address
      const jettonWalletAddr = await minter.getJettonWalletAddress(
        new TonWebAddress(wallet.value.account.address)
      );

      // Create JettonWallet instance
      const jettonWallet = new JettonWallet(tonweb.provider, {
        address: jettonWalletAddr,
      });

      // Calculate amount in nano units
      const amountToBurn = Number(amount) * 10 ** 9;

      // Create burn transaction
      const burnParams = {
        tokenAmount: new TonWeb.utils.BN(amountToBurn),
        jettonAmount: new TonWeb.utils.BN(amountToBurn),
        responseAddress: new TonWebAddress(wallet.value.account.address),
      };

      // Generate burn payload
      const burnBody = await jettonWallet.createBurnBody(burnParams);

      // Create transaction message
      const txData = {
        to: jettonWalletAddr,
        amount: TonWeb.utils.toNano("0.05"), // Standard fee for burn
        payload: burnBody,
      };

      // Send transaction
      const serializedBytes = await burnBody.toBoc();
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
        messages: [
          {
            address: txData.to.toString(),
            amount: txData.amount.toString(),
            payload: TonWeb.utils.bytesToBase64(serializedBytes),
          },
        ],
      });

      return result;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to burn Jettons";
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * Transfers Jettons to a specified address
   * @param jettonAddress - The address of the Jetton contract
   * @param destinationAddress - The address to transfer Jettons to
   * @param amount - The amount of Jettons to transfer
   */
  const transferJettons = async (
    jettonAddress: string,
    destinationAddress: string,
    amount: string
  ) => {
    if (!wallet.value?.account.address) {
      throw new Error("Wallet not connected");
    }

    try {
      isProcessing.value = true;
      error.value = null;

      // Create JettonMinter instance
      const minter = new JettonMinter(tonweb.provider, {
        address: new TonWebAddress(jettonAddress),
        adminAddress: new TonWebAddress(wallet.value.account.address),
        jettonContentUri: "",
        jettonWalletCodeHex: "",
      });

      // Get user's Jetton wallet address
      const jettonWalletAddr = await minter.getJettonWalletAddress(
        new TonWebAddress(wallet.value.account.address)
      );

      // Create JettonWallet instance
      const jettonWallet = new JettonWallet(tonweb.provider, {
        address: jettonWalletAddr,
      });

      // Calculate amount in nano units
      const amountToTransfer = Number(amount) * 10 ** 9;

      // Create transfer transaction
      const transferParams = {
        tokenAmount: new TonWeb.utils.BN(amountToTransfer),
        jettonAmount: new TonWeb.utils.BN(amountToTransfer),
        toAddress: new TonWebAddress(destinationAddress),
        responseAddress: new TonWebAddress(wallet.value.account.address),
        forwardAmount: new TonWeb.utils.BN(0),
        forwardPayload: undefined,
      };

      // Generate transfer payload
      const transferBody = await jettonWallet.createTransferBody(
        transferParams
      );

      // Create transaction message
      const txData = {
        to: jettonWalletAddr,
        amount: TonWeb.utils.toNano("0.05"), // Standard fee for transfer
        payload: transferBody,
      };

      // Send transaction
      const serializedBytes = await transferBody.toBoc();
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360, // 6 minutes
        messages: [
          {
            address: txData.to.toString(),
            amount: txData.amount.toString(),
            payload: TonWeb.utils.bytesToBase64(serializedBytes),
          },
        ],
      });

      return result;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to transfer Jettons";
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  return {
    burnJettons,
    transferJettons,
    isProcessing,
    error,
  };
};
