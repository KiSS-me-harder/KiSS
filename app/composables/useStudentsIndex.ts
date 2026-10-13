/**
 * Composable for the students index page.
 * Provides thread data, categories, active students, and thread management.
 */
import {
  studentCategories, defaultThreads, activeStudentsList,
  getStudentCategoryLabel, getStudentCategoryColor, getAvatarBgClass, buildStudentsStructuredData
} from '~/utils/studentsData'
import type { Thread } from '~/utils/studentsData'

export function useStudentsIndex() {
  useHead({ title: 'Students' })
  useSeoMeta({
    title: 'Students',
    description: 'Student messaging board at KiSS Academy.',
    ogTitle: 'Students',
    ogDescription: 'Student messaging board at KiSS Academy.',
    ogType: 'website'
  })
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: buildStudentsStructuredData()
    }]
  })

  const breadcrumbs = ref([
    { label: 'Students', icon: 'i-lucide-users', to: '/students' }
  ])

  const selectedCategory = ref('all')
  const categories = studentCategories
  const threads = ref<Thread[]>([...defaultThreads])
  const showNewThread = ref(false)
  const newThread = ref({ title: '', message: '', category: 'general' })
  const activeStudents = ref([...activeStudentsList])

  function postThread() {
    if (!newThread.value.title.trim() || !newThread.value.message.trim()) return
    const colors = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan']
    const avatars = ['i-lucide-user', 'i-lucide-smile', 'i-lucide-star', 'i-lucide-heart']
    threads.value.unshift({
      id: Date.now().toString(),
      title: newThread.value.title,
      preview: newThread.value.message,
      author: 'You',
      avatar: avatars[Math.floor(Math.random() * avatars.length)] || 'i-lucide-user',
      color: colors[Math.floor(Math.random() * colors.length)] || 'purple',
      category: newThread.value.category,
      replies: 0,
      time: 'Just now',
      pinned: false
    })
    newThread.value = { title: '', message: '', category: 'general' }
    showNewThread.value = false
  }

  const filteredThreads = computed(() => {
    if (selectedCategory.value === 'all') return threads.value
    return threads.value.filter(t => t.category === selectedCategory.value)
  })

  function viewThread(_thread: Thread) {
    // Thread detail view
  }

  return {
    breadcrumbs, selectedCategory, categories, threads,
    showNewThread, newThread, postThread, filteredThreads,
    activeStudents,
    getCategoryLabel: getStudentCategoryLabel,
    getCategoryColor: getStudentCategoryColor,
    getAvatarBgClass, viewThread
  }
}
