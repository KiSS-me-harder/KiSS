/**
 * Data and helpers for the students index page.
 * Extracted from useStudentsIndex to keep the composable within line limits.
 */

/**
 * Thread data structure.
 */
export interface Thread {
  id: string
  title: string
  preview: string
  author: string
  avatar: string
  color: string
  category: string
  replies: number
  time: string
  pinned: boolean
}

/**
 * Category definition.
 */
export interface Category {
  id: string
  label: string
}

/**
 * Active student entry.
 */
export interface ActiveStudent {
  name: string
  degree: string
}

/**
 * List of thread categories.
 */
export const studentCategories: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'classes', label: 'Classes' },
  { id: 'clubs', label: 'Clubs' },
  { id: 'introductions', label: 'Introductions' },
  { id: 'questions', label: 'Questions' }
]

/**
 * Default thread data.
 */
export const defaultThreads: Thread[] = [
  {
    id: '1', title: 'Welcome to the new semester!',
    preview: 'Hey everyone! Excited to see so many new faces this semester.',
    author: 'Professor Velvet', avatar: 'i-lucide-heart', color: 'pink',
    category: 'general', replies: 24, time: '2 hours ago', pinned: true
  },
  {
    id: '2', title: 'Study group for Anal Fundamentals 100',
    preview: 'Looking for classmates to form a study group.',
    author: 'Student_A', avatar: 'i-lucide-users', color: 'blue',
    category: 'classes', replies: 8, time: '5 hours ago', pinned: false
  },
  {
    id: '3', title: 'Fitness Club - New Schedule',
    preview: 'Updated workout schedule for this month.',
    author: 'Coach Flex', avatar: 'i-lucide-dumbbell', color: 'green',
    category: 'clubs', replies: 12, time: '1 day ago', pinned: false
  },
  {
    id: '4', title: 'New here - Introduction!',
    preview: 'Hi everyone, I just joined the school.',
    author: 'NewStudent_42', avatar: 'i-lucide-sparkles', color: 'purple',
    category: 'introductions', replies: 15, time: '2 days ago', pinned: false
  },
  {
    id: '5', title: 'How to track progress in classes?',
    preview: 'Can someone explain how the progress tracking works?',
    author: 'ConfusedStudent', avatar: 'i-lucide-help-circle', color: 'orange',
    category: 'questions', replies: 6, time: '3 days ago', pinned: false
  }
]

/**
 * List of active students.
 */
export const activeStudentsList: ActiveStudent[] = [
  { name: 'Professor Velvet', degree: 'Faculty' },
  { name: 'Student_A', degree: 'BSc' },
  { name: 'Coach Flex', degree: 'MSc' },
  { name: 'NewStudent_42', degree: 'BSc' },
  { name: 'ConfusedStudent', degree: 'PhD' }
]

/**
 * Returns the label for a category ID.
 * @param category - The category ID.
 * @returns The category label.
 */
export function getStudentCategoryLabel(category: string): string {
  const cat = studentCategories.find(c => c.id === category)
  return cat?.label || category
}

/**
 * Returns the color for a category.
 * @param category - The category ID.
 * @returns Color name for UI components.
 */
export function getStudentCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    general: 'neutral', classes: 'primary', clubs: 'success',
    introductions: 'info', questions: 'warning'
  }
  return colors[category] || 'neutral'
}

/**
 * Returns the avatar background class for a color.
 * @param color - The color name.
 * @returns Tailwind CSS background class.
 */
export function getAvatarBgClass(color: string): string {
  const classes: Record<string, string> = {
    purple: 'bg-purple-500', blue: 'bg-blue-500', green: 'bg-green-500',
    orange: 'bg-orange-500', pink: 'bg-pink-500', cyan: 'bg-cyan-500'
  }
  return classes[color] || 'bg-gray-500'
}

/**
 * Builds structured data JSON-LD for the students page.
 * @returns JSON string of structured data.
 */
export function buildStudentsStructuredData(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://kiss-academy.github.io/KiSS/students/#webpage',
        'url': 'https://kiss-academy.github.io/KiSS/students/',
        'name': 'Students',
        'description': 'Student messaging board at KiSS Academy.',
        'inLanguage': 'en',
        'isPartOf': { '@id': 'https://kiss-academy.github.io/KiSS/#website' }
      },
      {
        '@type': 'WebSite',
        '@id': 'https://kiss-academy.github.io/KiSS/#website',
        'url': 'https://kiss-academy.github.io/KiSS/',
        'name': 'KiSS Academy',
        'description': 'KiSS Academy - A gamified learning platform.',
        'inLanguage': 'en'
      }
    ]
  })
}
