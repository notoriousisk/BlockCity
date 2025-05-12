import "./assets/index.css";

import { createApp } from "vue";
import {
  retrieveLaunchParams,
} from "@telegram-apps/sdk-vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { errorHandler } from "./errorHandler";
import { init } from "./init";
import { TonConnectUIPlugin } from "./tonconnect";
import { publicUrl } from "./helperts/publicUrl";
import { useUserStore } from "@/stores/userStore";

// Mock the environment in case, we are outside Telegram.
import "./mockEnv";

// Configure all application dependencies.
init(
  retrieveLaunchParams().startParam === "debug" ||
    import.meta.env.VITE_DEV_DEBUG === "true"
);

const app = createApp(App);
const pinia = createPinia();

app.config.errorHandler = errorHandler;
app.use(pinia);
app.use(router);
app.use(TonConnectUIPlugin, {
  manifestUrl: publicUrl("tonconnect-manifest.json"),
});
app.mount("#app");

const userStore = useUserStore();
userStore.init();

// @ts-expect-error exists
if (window.Telegram) {
  // @ts-expect-error eee
  window.Telegram.WebApp.setHeaderColor("#bbdff8");
  // @ts-expect-error exists
  window.Telegram.WebApp.disableVerticalSwipes();
}
