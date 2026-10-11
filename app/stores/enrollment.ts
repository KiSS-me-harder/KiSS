import { storageGetItem, storageSetItem } from '~/utils/storage'

export interface LevelProgress {
  level: number
  completed: boolean
  completedAt?: number
}

export interface ClassEnrollment {
  // Unique identifier: "degree/class-name"
  slug: string
  className: string
  degree: string
  enrolledAt: number
  levels: LevelProgress[]
}

// Tracks which degree + title (level) the user has subscribed to
export interface DegreeEnrollment {
  degreeSlug: string
  title: string // e.g. "Junior", "Senior", "Master"
  enrolledAt: number
}

export interface FlashcardAnswer {
  cardId: number
  className: string
  level: number
  correct: boolean
  answeredAt: number
}

// Spaced repetition tracking for each individual card
export interface CardSpacedRep {
  cardId: number
  className: string
  degree: string
  level: number
  consecutiveSuccesses: number
  intervalDays: number
  dueDate: number // timestamp when card becomes due again
  lastFailed: number | null // timestamp of last failure, 0 if never failed
  totalCorrect: number
  totalIncorrect: number
}

export interface CharacterStats {
  obedience: number
  charm: number
  knowledge: number
  confidence: number
  flexibility: number
  creativity: number
}

export interface CharacterCustomization {
  hairColor: string
  skinTone: string
  eyeColor: string
  outfit: string
  accessories: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
}

export interface UserProfile {
  name: string
  email: string
  degree: string
  avatarSrc: string
  stats: CharacterStats
  customization: CharacterCustomization
  achievements: Achievement[]
  xp: number
  level: number
}

// --- Metrics System ---

export interface MetricField {
  id: string
  label: string
  unit: string
  icon?: string
}

export interface MetricMilestone {
  id: string
  title: string
  description: string
  requires: Record<string, number> // fieldId -> minimum value required
}

export interface MetricDataPoint {
  metricSlug: string
  fieldId: string
  value: number
  timestamp: number // Date.now() when logged
  activitySlug?: string // which activity logged this
}

export interface MetricProgress {
  metricSlug: string
  dataPoints: MetricDataPoint[] // all data points for this metric
}

// --- Clubs System ---

export interface ClubMembership {
  clubSlug: string
  joinedAt: number
}

// --- Exam Tasks System ---

export interface ExamTaskCompletion {
  classSlug: string // "degree/class-name"
  level: number
  taskId: number // index in the exam array
  completed: boolean
  completedAt?: number
}

export const useEnrollmentStore = defineStore('enrollment', () => {
  // --- User Profile ---
  const defaultStats: CharacterStats = {
    obedience: 10,
    charm: 5,
    knowledge: 8,
    confidence: 3,
    flexibility: 7,
    creativity: 6
  }

  const defaultCustomization: CharacterCustomization = {
    hairColor: '#8B4513',
    skinTone: '#F5D5C8',
    eyeColor: '#4A90D9',
    outfit: 'casual',
    accessories: []
  }

  const defaultAchievements: Achievement[] = [
    { id: 'first-class', title: 'First Step', description: 'Complete your first class level', icon: 'i-lucide-star', unlocked: false },
    { id: 'five-classes', title: 'Dedicated Student', description: 'Complete 5 class levels', icon: 'i-lucide-award', unlocked: false },
    { id: 'flashcard-master', title: 'Flashcard Master', description: 'Answer 50 flashcards correctly', icon: 'i-lucide-zap', unlocked: false },
    { id: 'obedient', title: 'Obedient', description: 'Reach obedience level 10', icon: 'i-lucide-heart', unlocked: false },
    { id: 'charming', title: 'Charming', description: 'Reach charm level 10', icon: 'i-lucide-sparkles', unlocked: false },
    { id: 'scholar', title: 'Scholar', description: 'Reach knowledge level 10', icon: 'i-lucide-book-open', unlocked: false },
    { id: 'confident', title: 'Confident', description: 'Reach confidence level 10', icon: 'i-lucide-flame', unlocked: false },
    { id: 'flexible', title: 'Flexible', description: 'Reach flexibility level 10', icon: 'i-lucide-wind', unlocked: false },
    { id: 'creative', title: 'Creative', description: 'Reach creativity level 10', icon: 'i-lucide-palette', unlocked: false },
    { id: 'all-stats-max', title: 'Perfectionist', description: 'Max out all stats', icon: 'i-lucide-crown', unlocked: false },
    { id: 'detention-free', title: 'Good Behavior', description: 'Complete a week with no detentions', icon: 'i-lucide-shield-check', unlocked: false },
    { id: 'enrolled-three', title: 'Multi-Tasker', description: 'Enroll in 3 classes simultaneously', icon: 'i-lucide-users', unlocked: false }
  ]

  const profile = ref<UserProfile>({
    name: 'Kisses Hugs',
    email: 'student@kiss.school',
    degree: 'Sissy',
    avatarSrc: useRuntimeConfig().app.baseURL + 'img/placeholder.webp',
    stats: { ...defaultStats },
    customization: { ...defaultCustomization },
    achievements: defaultAchievements.map(a => ({ ...a })),
    xp: 0,
    level: 1
  })

  // --- Enrollments ---
  const enrollments = ref<ClassEnrollment[]>([])

  // --- Degree Subscriptions ---
  const degreeEnrollments = ref<DegreeEnrollment[]>([])

  // --- Flashcard answers history ---
  const flashcardAnswers = ref<FlashcardAnswer[]>([])

  // --- Spaced repetition data per card ---
  const cardSpacedRep = ref<CardSpacedRep[]>([])

  // --- Detention count ---
  const detentionCount = ref(0)

  // --- Metrics ---
  const metricProgress = ref<MetricProgress[]>([])

  // --- Clubs ---
  const clubMemberships = ref<ClubMembership[]>([])

  // --- Exam Tasks ---
  const examTasks = ref<ExamTaskCompletion[]>([])

  // --- Computed ---

  const enrolledClassSlugs = computed(() =>
    enrollments.value.map(e => e.slug)
  )

  const enrolledClassCount = computed(() =>
    enrollments.value.length
  )

  const completedLevelsCount = computed(() =>
    enrollments.value.reduce((sum, e) =>
      sum + e.levels.filter(l => l.completed).length, 0
    )
  )

  const completedClassesCount = computed(() => {
    return enrollments.value.filter((e) => {
      if (e.levels.length === 0) return false
      return e.levels.every(l => l.completed)
    }).length
  })

  const flashcardsAnswered = computed(() =>
    flashcardAnswers.value.length
  )

  const flashcardsCorrect = computed(() =>
    flashcardAnswers.value.filter(a => a.correct).length
  )

  // --- Actions ---

  function updateProfile(updates: Partial<UserProfile>) {
    Object.assign(profile.value, updates)
  }

  // --- Character Stats ---

  function updateStat(stat: keyof CharacterStats, value: number) {
    const clamped = Math.max(0, Math.min(100, value))
    profile.value.stats[stat] = clamped
  }

  function addXp(amount: number) {
    profile.value.xp += amount
    // Level up every 100 XP
    const newLevel = Math.floor(profile.value.xp / 100) + 1
    if (newLevel > profile.value.level) {
      profile.value.level = newLevel
    }
  }

  function getXpForNextLevel() {
    const currentLevelXp = (profile.value.level - 1) * 100
    return 100 - (profile.value.xp - currentLevelXp)
  }

  // --- Character Customization ---

  function updateCustomization(updates: Partial<CharacterCustomization>) {
    Object.assign(profile.value.customization, updates)
  }

  function addAccessory(accessory: string) {
    if (!profile.value.customization.accessories.includes(accessory)) {
      profile.value.customization.accessories.push(accessory)
    }
  }

  function removeAccessory(accessory: string) {
    const index = profile.value.customization.accessories.indexOf(accessory)
    if (index !== -1) {
      profile.value.customization.accessories.splice(index, 1)
    }
  }

  // --- Achievements ---

  function unlockAchievement(id: string) {
    const achievement = profile.value.achievements.find(a => a.id === id)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = Date.now()
    }
  }

  function checkAchievements() {
    // Check stat-based achievements
    const stats = profile.value.stats
    if (stats.obedience >= 10) unlockAchievement('obedient')
    if (stats.charm >= 10) unlockAchievement('charming')
    if (stats.knowledge >= 10) unlockAchievement('scholar')
    if (stats.confidence >= 10) unlockAchievement('confident')
    if (stats.flexibility >= 10) unlockAchievement('flexible')
    if (stats.creativity >= 10) unlockAchievement('creative')

    // Check class-based achievements
    if (completedLevelsCount.value >= 1) unlockAchievement('first-class')
    if (completedLevelsCount.value >= 5) unlockAchievement('five-classes')
    if (enrolledClassCount.value >= 3) unlockAchievement('enrolled-three')

    // Check flashcard achievements
    if (flashcardsCorrect.value >= 50) unlockAchievement('flashcard-master')

    // Check all stats maxed
    if (Object.values(stats).every(v => v >= 10)) unlockAchievement('all-stats-max')
  }

  function getUnlockedAchievements() {
    return profile.value.achievements.filter(a => a.unlocked)
  }

  function enrollInClass(slug: string, className: string, degree: string, availableLevels: number[]) {
    // Don't enroll if already enrolled
    if (enrollments.value.some(e => e.slug === slug)) {
      return
    }

    const levels: LevelProgress[] = availableLevels.map(level => ({
      level,
      completed: false
    }))

    enrollments.value.push({
      slug,
      className,
      degree,
      enrolledAt: Date.now(),
      levels
    })
  }

  function unenrollFromClass(slug: string) {
    const index = enrollments.value.findIndex(e => e.slug === slug)
    if (index !== -1) {
      enrollments.value.splice(index, 1)
    }
  }

  function isEnrolled(slug: string) {
    return enrollments.value.some(e => e.slug === slug)
  }

  function getEnrollment(slug: string): ClassEnrollment | undefined {
    return enrollments.value.find(e => e.slug === slug)
  }

  function completeLevel(slug: string, level: number) {
    const enrollment = enrollments.value.find(e => e.slug === slug)
    if (!enrollment) return

    const levelProgress = enrollment.levels.find(l => l.level === level)
    if (levelProgress) {
      levelProgress.completed = true
      levelProgress.completedAt = Date.now()
    }
  }

  function resetLevel(slug: string, level: number) {
    const enrollment = enrollments.value.find(e => e.slug === slug)
    if (!enrollment) return

    const levelProgress = enrollment.levels.find(l => l.level === level)
    if (levelProgress) {
      levelProgress.completed = false
      levelProgress.completedAt = undefined
    }
  }

  function isLevelCompleted(slug: string, level: number): boolean {
    const enrollment = enrollments.value.find(e => e.slug === slug)
    if (!enrollment) return false

    const levelProgress = enrollment.levels.find(l => l.level === level)
    return levelProgress?.completed ?? false
  }

  function areDependenciesMet(slug: string, level: number, requiredDeps: { class: string, level: number }[]): boolean {
    for (const dep of requiredDeps) {
      if (!isLevelCompletedByName(dep.class, dep.level)) {
        return false
      }
    }
    return true
  }

  function isLevelCompletedByName(className: string, level: number): boolean {
    const enrollment = enrollments.value.find(e => e.className === className)
    if (!enrollment) return false
    const levelProgress = enrollment.levels.find(l => l.level === level)
    return levelProgress?.completed ?? false
  }

  function canEnroll(slug: string, requiredDeps: { class: string, level: number }[]): boolean {
    // Check if already enrolled
    if (isEnrolled(slug)) return false

    // Check if all dependencies are met
    for (const dep of requiredDeps) {
      if (!isLevelCompletedByName(dep.class, dep.level)) {
        return false
      }
    }
    return true
  }

  // --- Degree Subscription Actions ---

  function enrollInDegree(degreeSlug: string, title: string) {
    // Don't enroll if already enrolled in this degree+title
    if (degreeEnrollments.value.some(d => d.degreeSlug === degreeSlug && d.title === title)) {
      return
    }
    degreeEnrollments.value.push({
      degreeSlug,
      title,
      enrolledAt: Date.now()
    })
  }

  function unenrollFromDegree(degreeSlug: string, title: string) {
    const index = degreeEnrollments.value.findIndex(d => d.degreeSlug === degreeSlug && d.title === title)
    if (index !== -1) {
      degreeEnrollments.value.splice(index, 1)
    }
  }

  function isDegreeEnrolled(degreeSlug: string): boolean {
    return degreeEnrollments.value.some(d => d.degreeSlug === degreeSlug)
  }

  function getDegreeEnrollment(degreeSlug: string): DegreeEnrollment | undefined {
    return degreeEnrollments.value.find(d => d.degreeSlug === degreeSlug)
  }

  const enrolledDegreeSlugs = computed(() =>
    degreeEnrollments.value.map(d => d.degreeSlug)
  )

  function recordFlashcardAnswer(cardId: number, className: string, level: number, correct: boolean) {
    flashcardAnswers.value.push({
      cardId,
      className,
      level,
      correct,
      answeredAt: Date.now()
    })
  }

  // --- Spaced Repetition Functions ---

  // Get or create spaced rep entry for a card
  function getOrCreateCardRep(cardId: number, className: string, degree: string, level: number): CardSpacedRep {
    let entry = cardSpacedRep.value.find(e => e.cardId === cardId)
    if (!entry) {
      entry = {
        cardId,
        className,
        degree,
        level,
        consecutiveSuccesses: 0,
        intervalDays: 0,
        dueDate: 0, // due immediately
        lastFailed: null,
        totalCorrect: 0,
        totalIncorrect: 0
      }
      cardSpacedRep.value.push(entry)
    }
    return entry
  }

  // Record an answer and update spaced repetition data
  // Returns the updated entry
  function recordCardAnswerWithSpacedRep(cardId: number, className: string, degree: string, level: number, correct: boolean): CardSpacedRep {
    const entry = getOrCreateCardRep(cardId, className, degree, level)
    const now = Date.now()
    const msPerDay = 24 * 60 * 60 * 1000

    if (correct) {
      entry.consecutiveSuccesses++
      entry.totalCorrect++
      // Interval = number of consecutive successes in days
      entry.intervalDays = entry.consecutiveSuccesses
      // Card is due again after intervalDays days
      entry.dueDate = now + entry.intervalDays * msPerDay
    } else {
      entry.consecutiveSuccesses = 0
      entry.totalIncorrect++
      entry.lastFailed = now
      // Failed card goes straight back to deck (due immediately)
      entry.intervalDays = 0
      entry.dueDate = 0
    }

    // Also record in the general answer history
    flashcardAnswers.value.push({
      cardId,
      className,
      level,
      correct,
      answeredAt: now
    })

    return entry
  }

  // Get all cards that are due now (dueDate <= now), sorted by priority
  // Priority: weakest degree area first, then oldest due date
  function getDueCards(allCards: Array<{ id: number, className: string, degree: string, level: number }>): CardSpacedRep[] {
    const now = Date.now()

    // Build a map of degree -> weakness score (lower = weaker)
    // Weakness = more failures relative to successes
    const degreeScores: Record<string, { correct: number, incorrect: number }> = {}
    for (const entry of cardSpacedRep.value) {
      if (!degreeScores[entry.degree]) {
        degreeScores[entry.degree] = { correct: 0, incorrect: 0 }
      }
      degreeScores[entry.degree]!.correct += entry.totalCorrect
      degreeScores[entry.degree]!.incorrect += entry.totalIncorrect
    }

    // Calculate weakness score per degree
    // Higher score = weaker area (more focus needed)
    const degreeWeakness: Record<string, number> = {}
    for (const [degree, scores] of Object.entries(degreeScores)) {
      // If a degree has more failures than successes, it's weak
      // If never answered, treat as neutral (0)
      if (scores.incorrect > 0) {
        degreeWeakness[degree] = scores.incorrect / (scores.correct + scores.incorrect)
      } else if (scores.correct > 0) {
        degreeWeakness[degree] = 0 // strong area
      } else {
        degreeWeakness[degree] = 0.5 // neutral, never answered
      }
    }

    // Find due cards
    const dueCards: CardSpacedRep[] = []
    const cardIdSet = new Set(allCards.map(c => c.id))

    for (const entry of cardSpacedRep.value) {
      // Only include cards that still exist in the current deck
      if (!cardIdSet.has(entry.cardId)) continue
      // Include if due now
      if (entry.dueDate <= now) {
        dueCards.push(entry)
      }
    }

    // Sort by: 1) degree weakness (higher = more urgent), 2) consecutive successes (lower = more urgent)
    dueCards.sort((a, b) => {
      const weaknessA = degreeWeakness[a.degree] ?? 0.5
      const weaknessB = degreeWeakness[b.degree] ?? 0.5
      // Primary sort: weaker degree first (higher weakness score first)
      if (Math.abs(weaknessA - weaknessB) > 0.01) {
        return weaknessB - weaknessA
      }
      // Secondary sort: fewer consecutive successes first
      return a.consecutiveSuccesses - b.consecutiveSuccesses
    })

    return dueCards
  }

  // Get knowledge score for a degree (0-100, higher = stronger knowledge)
  function getDegreeKnowledgeScore(degree: string): number {
    const degreeCards = cardSpacedRep.value.filter(e => e.degree === degree)
    if (degreeCards.length === 0) return 0

    let totalCorrect = 0
    let totalIncorrect = 0
    for (const entry of degreeCards) {
      totalCorrect += entry.totalCorrect
      totalIncorrect += entry.totalIncorrect
    }

    const total = totalCorrect + totalIncorrect
    if (total === 0) return 0
    return Math.round((totalCorrect / total) * 100)
  }

  // Get overall knowledge breakdown by degree
  function getKnowledgeBreakdown(): Array<{ degree: string, score: number, cardsReviewed: number }> {
    const degreeData: Record<string, { correct: number, incorrect: number }> = {}
    for (const entry of cardSpacedRep.value) {
      if (!degreeData[entry.degree]) {
        degreeData[entry.degree] = { correct: 0, incorrect: 0 }
      }
      degreeData[entry.degree]!.correct += entry.totalCorrect
      degreeData[entry.degree]!.incorrect += entry.totalIncorrect
    }

    return Object.entries(degreeData).map(([degree, data]) => {
      const total = data.correct + data.incorrect
      const score = total > 0 ? Math.round((data.correct / total) * 100) : 0
      return {
        degree,
        score,
        cardsReviewed: total
      }
    }).sort((a, b) => a.score - b.score) // weakest first
  }

  function addDetention() {
    detentionCount.value++
  }

  // --- Metrics ---

  function getMetricProgress(metricSlug: string): MetricProgress | undefined {
    return metricProgress.value.find(m => m.metricSlug === metricSlug)
  }

  // Get the latest value for a specific field of a metric
  function getMetricValueField(metricSlug: string, fieldId: string): number {
    const progress = metricProgress.value.find(m => m.metricSlug === metricSlug)
    if (!progress || !progress.dataPoints || progress.dataPoints.length === 0) return 0
    const fieldPoints = progress.dataPoints
      .filter(dp => dp.fieldId === fieldId)
      .sort((a, b) => b.timestamp - a.timestamp)
    return fieldPoints[0]?.value ?? 0
  }

  // Get all data points for a metric field, sorted by time (for graphs)
  function getMetricDataPoints(metricSlug: string, fieldId?: string): MetricDataPoint[] {
    const progress = metricProgress.value.find(m => m.metricSlug === metricSlug)
    if (!progress || !progress.dataPoints) return []
    let points = progress.dataPoints
    if (fieldId) {
      points = points.filter(dp => dp.fieldId === fieldId)
    }
    return [...points].sort((a, b) => a.timestamp - b.timestamp)
  }

  // Get the latest data points for all fields of a metric
  function getMetricLatestValues(metricSlug: string): Record<string, number> {
    const progress = metricProgress.value.find(m => m.metricSlug === metricSlug)
    if (!progress || !progress.dataPoints || progress.dataPoints.length === 0) return {}
    const fieldLatest: Record<string, { value: number, timestamp: number }> = {}
    for (const dp of progress.dataPoints) {
      const existing = fieldLatest[dp.fieldId]
      if (!existing || dp.timestamp > existing.timestamp) {
        fieldLatest[dp.fieldId] = { value: dp.value, timestamp: dp.timestamp }
      }
    }
    const result: Record<string, number> = {}
    for (const [fieldId, data] of Object.entries(fieldLatest)) {
      result[fieldId] = data.value
    }
    return result
  }

  function isMilestoneAchieved(metricSlug: string, milestone: MetricMilestone): boolean {
    const latestValues = getMetricLatestValues(metricSlug)
    for (const [fieldId, requiredValue] of Object.entries(milestone.requires)) {
      const currentValue = latestValues[fieldId] ?? 0
      if (currentValue < requiredValue) return false
    }
    return true
  }

  function getAchievedMilestoneCount(metricSlug: string, milestones: MetricMilestone[]): number {
    return milestones.filter(m => isMilestoneAchieved(metricSlug, m)).length
  }

  // Log an activity session, creating data points for contributed metrics
  function logActivity(activitySlug: string, contributions: Array<{ metric: string, map: Record<string, string> }>, fieldValues: Record<string, number>) {
    const now = Date.now()

    for (const contribution of contributions) {
      let progress = metricProgress.value.find(m => m.metricSlug === contribution.metric)
      if (!progress) {
        progress = {
          metricSlug: contribution.metric,
          dataPoints: []
        }
        metricProgress.value.push(progress)
      }

      // For each field mapping, create a data point
      for (const [activityField, metricField] of Object.entries(contribution.map)) {
        const value = fieldValues[activityField]
        if (value === undefined || value === null) continue

        // For max-type fields (like maxVolume), only update if this value is higher
        if (metricField.startsWith('max')) {
          const currentValue = getMetricValueField(contribution.metric, metricField)
          if (value <= currentValue) continue
        }

        progress.dataPoints.push({
          metricSlug: contribution.metric,
          fieldId: metricField,
          value,
          timestamp: now,
          activitySlug
        })
      }
    }
  }

  // Delete a data point
  function deleteDataPoint(metricSlug: string, dataPointIndex: number) {
    const progress = metricProgress.value.find(m => m.metricSlug === metricSlug)
    if (progress && progress.dataPoints) {
      progress.dataPoints.splice(dataPointIndex, 1)
    }
  }

  // Check if an activity has been logged today (any data point with this activitySlug within the last 24h)
  function hasActivityLoggedToday(activitySlug: string): boolean {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const todayStart = startOfToday.getTime()

    for (const progress of metricProgress.value) {
      for (const dp of progress.dataPoints) {
        if (dp.activitySlug === activitySlug && dp.timestamp >= todayStart) {
          return true
        }
      }
    }
    return false
  }

  // --- Clubs ---

  // Check if the user is enrolled in at least one class belonging to a degree
  function hasDegreeEnrollment(degreeSlug: string): boolean {
    return enrollments.value.some(e => e.degree === degreeSlug)
  }

  function joinClub(clubSlug: string, requiredDegree?: string): boolean {
    if (clubMemberships.value.some(m => m.clubSlug === clubSlug)) return true
    // Check prerequisite: user must be enrolled in the required degree
    if (requiredDegree && !hasDegreeEnrollment(requiredDegree)) {
      return false
    }
    clubMemberships.value.push({
      clubSlug,
      joinedAt: Date.now()
    })
    return true
  }

  function leaveClub(clubSlug: string) {
    const index = clubMemberships.value.findIndex(m => m.clubSlug === clubSlug)
    if (index !== -1) {
      clubMemberships.value.splice(index, 1)
    }
  }

  function isClubMember(clubSlug: string): boolean {
    return clubMemberships.value.some(m => m.clubSlug === clubSlug)
  }

  // --- Exam Tasks ---

  function toggleExamTask(classSlug: string, level: number, taskId: number) {
    let task = examTasks.value.find(
      t => t.classSlug === classSlug && t.level === level && t.taskId === taskId
    )
    if (!task) {
      task = {
        classSlug,
        level,
        taskId,
        completed: true,
        completedAt: Date.now()
      }
      examTasks.value.push(task)
    } else {
      if (task.completed) {
        task.completed = false
        task.completedAt = undefined
      } else {
        task.completed = true
        task.completedAt = Date.now()
      }
    }
  }

  function isExamTaskCompleted(classSlug: string, level: number, taskId: number): boolean {
    const task = examTasks.value.find(
      t => t.classSlug === classSlug && t.level === level && t.taskId === taskId
    )
    return task?.completed ?? false
  }

  // Get all activity slugs from joined clubs
  function getClubActivitySlugs(clubActivitiesMap: Record<string, string[]>): string[] {
    const slugs = new Set<string>()
    for (const membership of clubMemberships.value) {
      const activities = clubActivitiesMap[membership.clubSlug]
      if (activities) {
        for (const slug of activities) {
          slugs.add(slug)
        }
      }
    }
    return [...slugs]
  }

  // --- Persistence via localStorage ---

  function saveToStorage() {
    if (import.meta.client) {
      const data = {
        profile: profile.value,
        enrollments: enrollments.value,
        degreeEnrollments: degreeEnrollments.value,
        flashcardAnswers: flashcardAnswers.value,
        cardSpacedRep: cardSpacedRep.value,
        detentionCount: detentionCount.value,
        metricProgress: metricProgress.value,
        clubMemberships: clubMemberships.value,
        examTasks: examTasks.value,
        version: 10
      }
      try {
        storageSetItem('kiss-enrollment', JSON.stringify(data))
      } catch {
        // Storage might be unavailable
      }
    }
  }

  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const raw = storageGetItem('kiss-enrollment')
      if (!raw) return

      const data = JSON.parse(raw)
      if (data.profile) {
        // Merge with defaults to ensure new fields exist
        profile.value = {
          ...profile.value,
          ...data.profile,
          stats: { ...defaultStats, ...(data.profile.stats || {}) },
          customization: { ...defaultCustomization, ...(data.profile.customization || {}) },
          achievements: data.profile.achievements || defaultAchievements.map(a => ({ ...a })),
          xp: data.profile.xp ?? 0,
          level: data.profile.level ?? 1
        }
      }
      if (data.enrollments) enrollments.value = data.enrollments
      if (data.flashcardAnswers) flashcardAnswers.value = data.flashcardAnswers
      if (data.cardSpacedRep) cardSpacedRep.value = data.cardSpacedRep
      if (typeof data.detentionCount === 'number') detentionCount.value = data.detentionCount
      // Only load metric progress if version supports data points format
      if (data.metricProgress && data.version >= 7) metricProgress.value = data.metricProgress
      // Only load club memberships if version supports them
      if (data.clubMemberships && data.version >= 8) clubMemberships.value = data.clubMemberships
      // Only load exam tasks if version supports them
      if (data.examTasks && data.version >= 9) examTasks.value = data.examTasks
      // Only load degree enrollments if version supports them
      if (data.degreeEnrollments && data.version >= 10) degreeEnrollments.value = data.degreeEnrollments
    } catch {
      // Corrupted data, start fresh
    }
  }

  // Load from localStorage after Nuxt hydration to avoid SSR state overwriting client data
  if (import.meta.client) {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.isHydrated) {
      loadFromStorage()
    } else {
      watch(() => nuxtApp.isHydrated, (hydrated) => {
        if (hydrated) {
          loadFromStorage()
        }
      }, { once: true })
    }
  }

  // Auto-save on changes
  watch([profile, enrollments, degreeEnrollments, flashcardAnswers, cardSpacedRep, detentionCount, metricProgress, clubMemberships, examTasks], () => {
    saveToStorage()
  }, { deep: true })

  return {
    // State
    profile,
    enrollments,
    degreeEnrollments,
    flashcardAnswers,
    detentionCount,
    metricProgress,
    // Computed
    enrolledClassSlugs,
    enrolledClassCount,
    completedLevelsCount,
    completedClassesCount,
    flashcardsAnswered,
    flashcardsCorrect,
    // Actions
    updateProfile,
    updateStat,
    addXp,
    getXpForNextLevel,
    updateCustomization,
    addAccessory,
    removeAccessory,
    unlockAchievement,
    checkAchievements,
    getUnlockedAchievements,
    enrollInClass,
    unenrollFromClass,
    isEnrolled,
    getEnrollment,
    completeLevel,
    resetLevel,
    isLevelCompleted,
    areDependenciesMet,
    canEnroll,
    recordFlashcardAnswer,
    // Spaced repetition
    cardSpacedRep,
    getOrCreateCardRep,
    recordCardAnswerWithSpacedRep,
    getDueCards,
    getDegreeKnowledgeScore,
    getKnowledgeBreakdown,
    addDetention,
    // Metrics
    getMetricProgress,
    getMetricValueField,
    getMetricDataPoints,
    getMetricLatestValues,
    isMilestoneAchieved,
    getAchievedMilestoneCount,
    logActivity,
    deleteDataPoint,
    hasActivityLoggedToday,
    // Clubs
    clubMemberships,
    joinClub,
    leaveClub,
    isClubMember,
    hasDegreeEnrollment,
    getClubActivitySlugs,
    // Exam Tasks
    examTasks,
    toggleExamTask,
    isExamTaskCompleted,
    // Degree subscriptions
    enrollInDegree,
    unenrollFromDegree,
    isDegreeEnrolled,
    getDegreeEnrollment,
    enrolledDegreeSlugs,
    // Persistence
    loadFromStorage,
    saveToStorage
  }
})
