<script setup lang="ts">
interface RoutineItem {
  id: number
  title: string
  completed: boolean
}

interface RoutineSection {
  id: string
  title: string
  subtitle: string
  icon: string
  items: RoutineItem[]
}

const now = new Date()
const hours = now.getHours()
const minutes = now.getMinutes()
const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()

const sections = ref<RoutineSection[]>([
  {
    id: 'morning',
    title: 'Morning',
    subtitle: 'Are you ready for training, Girl?',
    icon: 'i-lucide-sunrise',
    items: [
      { id: 1, title: 'Wake up and stretch', completed: true },
      { id: 2, title: 'Morning affirmation', completed: true },
      { id: 3, title: 'Wear assigned underwear', completed: false },
    ]
  },
  {
    id: 'lunch',
    title: 'Lunch',
    subtitle: 'Midday break',
    icon: 'i-lucide-sun',
    items: [
      { id: 4, title: 'Check in with instructor', completed: false },
    ]
  },
  {
    id: 'evening',
    title: 'Evening',
    subtitle: 'After work',
    icon: 'i-lucide-sunset',
    items: [
      { id: 5, title: 'Evening reflection', completed: false },
      { id: 6, title: 'Submit daily report', completed: false },
    ]
  },
  {
    id: 'bedtime',
    title: 'Bedtime',
    subtitle: 'Wind down',
    icon: 'i-lucide-moon',
    items: [
      { id: 7, title: 'Lock device check', completed: false },
    ]
  }
])

const bonusTasks = [
  { label: '3 tasks', discount: '10%' },
  { label: '4 tasks', discount: '20%' },
  { label: '5+ tasks', discount: '25%' }
]

const completedCount = computed(() => {
  return sections.value.flatMap(s => s.items).filter(i => i.completed).length
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header with time -->
    <div class="flex items-center gap-2 text-sm text-muted">
      <UIcon name="i-lucide-clock" class="size-4" />
      <span class="font-medium">TODAY · {{ dayName }}</span>
      <span>· {{ timeString }}</span>
    </div>

    <!-- Bonus credits card -->
    <UCard>
      <div class="flex items-center gap-2 mb-3">
        <div class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <UIcon name="i-lucide-repeat" class="size-3 text-primary" />
        </div>
        <span class="text-sm font-medium">Lock in 3 or more tasks to earn bonus credits</span>
      </div>
      <div class="flex gap-2">
        <button
          v-for="bonus in bonusTasks"
          :key="bonus.label"
          class="px-3 py-1.5 rounded-lg text-xs font-medium bg-elevated text-muted hover:bg-elevated/80 transition-colors"
        >
          {{ bonus.label }} · {{ bonus.discount }}
        </button>
      </div>
    </UCard>

    <!-- Action buttons -->
    <div class="flex gap-2">
      <UButton variant="solid" size="sm" class="bg-primary/90">
        <template #leading>
          <UIcon name="i-lucide-lock" class="size-3" />
        </template>
        Lock in
      </UButton>
      <UButton variant="outline" size="sm">
        <template #leading>
          <UIcon name="i-lucide-save" class="size-3" />
        </template>
        Save template
      </UButton>
      <UButton variant="ghost" size="sm" class="text-xs">
        Add more tasks to lock in
      </UButton>
    </div>

    <!-- Routine sections -->
    <div class="space-y-4">
      <div
        v-for="section in sections"
        :key="section.id"
        class="space-y-2"
      >
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-elevated flex items-center justify-center ring-1 ring-default">
            <UIcon :name="section.icon" class="size-4 text-primary" />
          </div>
          <div>
            <p class="text-sm font-semibold">
              {{ section.title }}
            </p>
            <p class="text-xs text-muted">
              {{ section.subtitle }}
            </p>
          </div>
        </div>

        <div class="space-y-1.5 pl-9">
          <div
            v-for="item in section.items"
            :key="item.id"
            class="flex items-center gap-2 p-3 rounded-lg border border-dashed border-default/50 hover:border-primary/50 transition-colors cursor-pointer"
            :class="{ 'opacity-50': item.completed }"
            @click="item.completed = !item.completed"
          >
            <div class="w-4 h-4 rounded border flex items-center justify-center shrink-0"
              :class="item.completed ? 'bg-primary border-primary' : 'border-muted'"
            >
              <UIcon v-if="item.completed" name="i-lucide-check" class="size-3 text-primary-foreground" />
            </div>
            <span class="text-sm" :class="{ 'line-through text-muted': item.completed }">
              {{ item.title }}
            </span>
          </div>

          <button class="w-full flex items-center gap-2 p-2 rounded-lg border border-dashed border-default/30 text-muted hover:border-primary/30 transition-colors">
            <UIcon name="i-lucide-plus" class="size-4" />
            <span class="text-sm">Add to {{ section.title.toLowerCase() }}...</span>
            <UIcon name="i-lucide-chevron-down" class="size-3 ml-auto" />
          </button>
        </div>
      </div>
    </div>

    <!-- Goodnight message -->
    <div class="flex items-center gap-2 pt-4">
      <div class="w-7 h-7 rounded-full bg-elevated flex items-center justify-center ring-1 ring-default">
        <span class="text-xs text-muted">Zzz</span>
      </div>
      <p class="text-sm text-muted">Goodnight, my precious Girl</p>
    </div>
  </div>
</template>
