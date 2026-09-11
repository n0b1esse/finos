import { useState } from "react";

export function useLocalStorageState(key: string, initial: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) return stored === "true";
    // One-time migration from the previous brand prefix (aurum:* -> finos:*).
    if (key.startsWith("finos:")) {
      const legacy = localStorage.getItem(key.replace(/^finos:/, "aurum:"));
      if (legacy !== null) {
        localStorage.setItem(key, legacy);
        return legacy === "true";
      }
    }
    return initial;
  });

  const update = (next: boolean) => {
    setValue(next);
    localStorage.setItem(key, String(next));
  };

  return [value, update] as const;
}
