// Enrollment store types extracted from app/stores/enrollment.ts

/** Tracks progress for a single level within a course enrollment. */
export interface LevelProgress {
  level: number
  completed: boolean
  completedAt?: number
}

/** Represents a user's enrollment in a specific course, including level progress. */
export interface CourseEnrollment {
  slug: string
  courseName: string
  degree: string
  enrolledAt: number
  levels: LevelProgress[]
}

/** Represents a user's subscription to a degree program at a specific title level. */
export interface DegreeEnrollment {
  degreeSlug: string
  title: string
  enrolledAt: number
}

/** Records a single flashcard answer attempt. */
export interface FlashcardAnswer {
  cardId: number
  courseName: string
  level: number
  correct: boolean
  answeredAt: number
}

/** Spaced repetition tracking data for a single flashcard. */
export interface CardSpacedRep {
  cardId: number
  courseName: string
  degree: string
  level: number
  consecutiveSuccesses: number
  intervalDays: number
  dueDate: number
  lastFailed: number | null
  totalCorrect: number
  totalIncorrect: number
}

/** Character stat values ranging from 0 to 100. */
export interface CharacterStats {
  obedience: number
  charm: number
  knowledge: number
  confidence: number
  flexibility: number
  creativity: number
}

/** Visual customization options for the user's character avatar. */
export interface CharacterCustomization {
  hairColor: string
  skinTone: string
  eyeColor: string
  outfit: string
  accessories: string[]
}

/** An achievement that can be unlocked by meeting certain criteria. */
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
}

/** The user's complete profile including stats, customization, and achievements. */
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

/** Defines a measurable field within a metric (e.g., reps, duration). */
export interface MetricField {
  id: string
  label: string
  unit: string
  icon?: string
}

/** A milestone that is achieved when metric field values meet required thresholds. */
export interface MetricMilestone {
  id: string
  title: string
  description: string
  requires: Record<string, number>
}

/** A single recorded data point for a metric field at a point in time. */
export interface MetricDataPoint {
  metricSlug: string
  fieldId: string
  value: number
  timestamp: number
  activitySlug?: string
}

/** Aggregates all data points for a given metric. */
export interface MetricProgress {
  metricSlug: string
  dataPoints: MetricDataPoint[]
}

/** Tracks a user's membership in a club. */
export interface ClubMembership {
  clubSlug: string
  joinedAt: number
}

/** Tracks completion status of an exam task within a course level. */
export interface ExamTaskCompletion {
  courseSlug: string
  level: number
  taskId: number
  completed: boolean
  completedAt?: number
}
