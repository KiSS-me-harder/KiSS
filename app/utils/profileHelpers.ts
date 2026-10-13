/**
 * Profile and character management helpers for enrollment.
 * Extracted from useEnrollmentLogic to keep the composable within line limits.
 */
import type { CharacterStats, CharacterCustomization, UserProfile } from '~/types/enrollment'
import { createDefaultAchievements } from '~/utils/enrollmentHelpers'

/**
 * Creates default character stats.
 * @returns Default stats object.
 */
export function createDefaultStats(): CharacterStats {
  return { obedience: 10, charm: 5, knowledge: 8, confidence: 3, flexibility: 7, creativity: 6 }
}

/**
 * Creates default character customization.
 * @returns Default customization object.
 */
export function createDefaultCustomization(): CharacterCustomization {
  return { hairColor: '#8B4513', skinTone: '#F5D5C8', eyeColor: '#4A90D9', outfit: 'casual', accessories: [] }
}

/**
 * Creates a default user profile.
 * @param baseUrl - The base URL for asset paths.
 * @returns Default UserProfile object.
 */
export function createDefaultProfile(baseUrl: string): UserProfile {
  const defaultStats = createDefaultStats()
  const defaultCustomization = createDefaultCustomization()
  return {
    name: 'Kisses Hugs', email: 'student@kiss.school', degree: 'Sissy',
    avatarSrc: baseUrl + 'img/placeholder.webp',
    stats: { ...defaultStats }, customization: { ...defaultCustomization },
    achievements: createDefaultAchievements(), xp: 0, level: 1
  }
}

/**
 * Updates profile fields with the given partial updates.
 * @param profile - The profile ref to update.
 * @param updates - Partial profile data to merge.
 */
export function updateProfile(profile: Ref<UserProfile>, updates: Partial<UserProfile>) {
  Object.assign(profile.value, updates)
}

/**
 * Updates a single character stat value, clamped to 0-100.
 * @param profile - The profile ref.
 * @param stat - The stat key to update.
 * @param value - The new value.
 */
export function updateStat(profile: Ref<UserProfile>, stat: keyof CharacterStats, value: number) {
  profile.value.stats[stat] = Math.max(0, Math.min(100, value))
}

/**
 * Adds XP to the profile and updates level if threshold reached.
 * @param profile - The profile ref.
 * @param amount - XP amount to add.
 */
export function addXp(profile: Ref<UserProfile>, amount: number) {
  profile.value.xp += amount
  const newLevel = Math.floor(profile.value.xp / 100) + 1
  if (newLevel > profile.value.level) profile.value.level = newLevel
}

/**
 * Returns the XP needed for the next level.
 * @param profile - The profile ref.
 * @returns XP remaining for next level.
 */
export function getXpForNextLevel(profile: Ref<UserProfile>) {
  return 100 - ((profile.value.xp - 1) % 100)
}

/**
 * Updates character customization fields.
 * @param profile - The profile ref.
 * @param updates - Partial customization data to merge.
 */
export function updateCustomization(profile: Ref<UserProfile>, updates: Partial<CharacterCustomization>) {
  Object.assign(profile.value.customization, updates)
}

/**
 * Adds an accessory if not already present.
 * @param profile - The profile ref.
 * @param accessory - Accessory name to add.
 */
export function addAccessory(profile: Ref<UserProfile>, accessory: string) {
  if (!profile.value.customization.accessories.includes(accessory)) {
    profile.value.customization.accessories.push(accessory)
  }
}

/**
 * Removes an accessory if present.
 * @param profile - The profile ref.
 * @param accessory - Accessory name to remove.
 */
export function removeAccessory(profile: Ref<UserProfile>, accessory: string) {
  const idx = profile.value.customization.accessories.indexOf(accessory)
  if (idx !== -1) profile.value.customization.accessories.splice(idx, 1)
}

/**
 * Unlocks an achievement by ID.
 * @param profile - The profile ref.
 * @param id - Achievement ID to unlock.
 */
export function unlockAchievement(profile: Ref<UserProfile>, id: string) {
  const a = profile.value.achievements.find(a => a.id === id)
  if (a && !a.unlocked) {
    a.unlocked = true
    a.unlockedAt = Date.now()
  }
}

/**
 * Re-syncs achievements with the default list, preserving unlocked state.
 * @param profile - The profile ref.
 */
export function checkAchievements(profile: Ref<UserProfile>) {
  const defaults = createDefaultAchievements()
  profile.value.achievements = defaults.map((def) => {
    const existing = profile.value.achievements.find(a => a.id === def.id)
    return existing || def
  })
}

/**
 * Returns the list of unlocked achievements.
 * @param profile - The profile ref.
 * @returns Array of unlocked achievements.
 */
export function getUnlockedAchievements(profile: Ref<UserProfile>) {
  return profile.value.achievements.filter(a => a.unlocked)
}
