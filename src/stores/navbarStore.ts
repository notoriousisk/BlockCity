import { ref } from "vue";
import { defineStore } from "pinia";
import { Home, ShoppingBag, Gamepad2, User } from "lucide-vue-next";

import { useRoute, useRouter } from "vue-router";

export const useNavbarStore = defineStore("navbar", () => {
  const router = useRouter();
  const route = useRoute();

  const activeTab = ref<"home" | "shop" | "game" | "user">(
    route.name as "home" | "shop" | "game" | "user"
  );

  const tabColors = {
    home: "#bbdff8",
    shop: "#3b82f6",
    game: "#1f94e9",
    user: "#3b82f6",
  };

  const navbarTabs = [
    { name: "home", label: "Home", icon: Home },
    { name: "shop", label: "Shop", icon: ShoppingBag },
    { name: "game", label: "Game", icon: Gamepad2 },
    { name: "user", label: "User", icon: User },
  ];

  const setActiveTab = (tab: string) => {
    activeTab.value = tab as "home" | "shop" | "game" | "user";
    router.push({ name: tab });

    // @ts-expect-error exists
    if (window.Telegram) {
      // @ts-expect-error eee
      window.Telegram.WebApp.setHeaderColor(tabColors[activeTab.value] ?? '#bbdff8');
    }
  };
  return {
    navbarTabs,
    activeTab,
    setActiveTab,
  };
});
