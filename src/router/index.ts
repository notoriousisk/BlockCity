import { createRouter, createWebHistory } from "vue-router";
import IndexPage from "@/pages/IndexPage.vue";
import InitDataPage from "@/pages/UserPage.vue";
import ShopPage from "@/pages/ShopPage.vue";
import GamePage from "@/pages/StartGamePage.vue";
import GameLevel from "@/pages/GameLevelPage.vue";

export const routes = [
  {
    path: "/",
    name: "home",
    component: IndexPage,
  },
  {
    path: "/user",
    name: "user",
    component: InitDataPage,
    meta: {
      title: "Init Data",
    },
  },
  {
    path: "/shop",
    name: "shop",
    component: ShopPage,
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
    path: "/game-level",
    name: "GameLevel",
    component: GameLevel,
    meta: {
      title: "Game Level",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
