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

  const navbarTabs = [
    { name: "home", label: "Home", icon: Home },
    { name: "shop", label: "Shop", icon: ShoppingBag },
    { name: "game", label: "Game", icon: Gamepad2 },
    { name: "user", label: "User", icon: User },
  ];

  const setActiveTab = (tab: string) => {
    activeTab.value = tab as "home" | "shop" | "game" | "user";
    router.push({ name: tab });
  };
  return {
    navbarTabs,
    activeTab,
    setActiveTab,
  };
});
