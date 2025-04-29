import { createRouter, createWebHistory } from "vue-router";
import IndexPage from "@/pages/IndexPage.vue";
import InitDataPage from "@/pages/InitDataPage.vue";
import ThemeParamsPage from "@/pages/ThemeParamsPage.vue";
import GamePage from "@/pages/GamePage.vue";
import TonConnectPage from "@/pages/TonConnectPage.vue";
import IconTonConnect from "@/components/IconTonConnect.vue";

export const routes = [
  {
    path: "/",
    name: "home",
    component: IndexPage,
  },
  {
    path: "/init-data",
    name: "user",
    component: InitDataPage,
    meta: {
      title: "Init Data",
    },
  },
  {
    path: "/theme-params",
    name: "shop",
    component: ThemeParamsPage,
    meta: {
      title: "Theme Params",
    },
  },
  {
    path: "/game",
    name: "game",
    component: GamePage,
    meta: {
      title: "Game Page",
    },
  },
  {
    path: "/ton-connect",
    name: "ton-connect",
    component: TonConnectPage,
    meta: {
      icon: IconTonConnect,
      title: "TON Connect",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
