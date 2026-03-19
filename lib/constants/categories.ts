/**
 * Plugin categories for Minecraft server plugins.
 * value: stored in DB / API; label: displayed in UI.
 */
export const PLUGIN_CATEGORIES: { value: string; label: string }[] = [
  { value: "admin", label: "Administration" },
  { value: "anti-grief", label: "Anti-Grief" },
  { value: "arenas", label: "Arenas" },
  { value: "chat", label: "Chat" },
  { value: "compatibility", label: "Compatibility" },
  { value: "cosmetic", label: "Skins & Cosmetics" },
  { value: "creative", label: "Creative" },
  { value: "crates", label: "Crates & Loot" },
  { value: "developer", label: "Developer / API" },
  { value: "donator", label: "Donator Perks" },
  { value: "duels", label: "Duels" },
  { value: "dungeons", label: "Dungeons" },
  { value: "economy", label: "Economy" },
  { value: "factions", label: "Factions" },
  { value: "fixes", label: "Fixes" },
  { value: "fun", label: "Fun" },
  { value: "integration", label: "Integration" },
  { value: "jobs", label: "Jobs" },
  { value: "kits", label: "Kits" },
  { value: "land-claim", label: "Land Claim" },
  { value: "library", label: "Library" },
  { value: "logging", label: "Logging" },
  { value: "magic", label: "Magic" },
  { value: "mechanics", label: "Gameplay Mechanics" },
  { value: "minigames", label: "Minigames" },
  { value: "misc", label: "Miscellaneous" },
  { value: "parkour", label: "Parkour" },
  { value: "permissions", label: "Permissions" },
  { value: "prison", label: "Prison" },
  { value: "protection", label: "Protection" },
  { value: "punishment", label: "Punishment / Moderation" },
  { value: "pvp", label: "PvP" },
  { value: "quests", label: "Quests" },
  { value: "rpg", label: "RPG / Roleplay" },
  { value: "skript", label: "Skript" },
  { value: "social", label: "Social" },
  { value: "survival", label: "Survival" },
  { value: "teleportation", label: "Teleportation" },
  { value: "utilities", label: "Utilities" },
  { value: "voting", label: "Voting" },
  { value: "world-management", label: "World Management" },
];

export const DEFAULT_PLUGIN_CATEGORY = "economy";

/** Get display label for a category value, or the value itself if unknown. */
export function getCategoryLabel(value: string): string {
  const found = PLUGIN_CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value;
}
