import type { GameBackendLevel } from "@/types";
import { fetchLevel } from "@/firebase/firebaseService";

export async function loadLevel(id: number): Promise<GameBackendLevel | null> {
  const lvl = await fetchLevel(id);
  return lvl || null;
}
