<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
          :ui="collapsed ? undefined : {
            base: 'py-4 mt-2'
          }"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
          :ui="collapsed ? undefined : {
            linkLeadingIcon: 'size-7'
          }"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" :color-mode="false" />

    <slot />

    <MediaPlayerWidget />
    <NotificationsSlideover />
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const route = useRoute()

const { data: degrees } = await useAsyncData('layout-degrees', () => queryCollection('degrees').all())
const { data: allClasses } = await useAsyncData('layout-classes', () => queryCollection('classes').all())
const { data: clubs } = await useAsyncData('layout-clubs', () => queryCollection('clubs').all())
const { data: punishments } = await useAsyncData('layout-punishments', () => queryCollection('punishments').all())
const { data: faculty } = await useAsyncData('layout-faculty', () => queryCollection('faculty').all())

const degreesChildren = computed(() =>
  (degrees.value || []).map(item => ({
    label: item.title,
    to: `/${item.stem}`,
    onSelect: () => {
      open.value = false
    }
  }))
)

const classesChildren = computed(() => {
  if (!allClasses.value) return []
  const classMap = new Map<string, { label: string, to: string }>()
  for (const item of allClasses.value) {
    const parts = (item as any).stem?.split('/') || []
    if (parts.length < 4) continue
    const degree = parts[1]
    const className = parts[2]
    const classSlug = `${degree}/${className}`
    if (!classMap.has(classSlug)) {
      const classTitle = (item as any).meta?.class || className.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      classMap.set(classSlug, {
        label: classTitle,
        to: `/classes/${classSlug}`
      })
    }
  }
  return Array.from(classMap.values())
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(item => ({
      ...item,
      onSelect: () => {
        open.value = false
      }
    }))
})

const clubsChildren = computed(() =>
  (clubs.value || []).map(item => ({
    label: item.title,
    to: `/${item.stem}`,
    onSelect: () => {
      open.value = false
    }
  }))
)

const punishmentsChildren = computed(() =>
  (punishments.value || []).map(item => ({
    label: item.title,
    to: `/${item.stem}`,
    onSelect: () => {
      open.value = false
    }
  }))
)

const facultyChildren = computed(() =>
  (faculty.value || []).map(item => ({
    label: item.title,
    to: `/teachers/${(item as any).path.split('/').pop()}`,
    onSelect: () => {
      open.value = false
    }
  }))
)

const links = computed(() => [[{
  label: 'Today',
  icon: 'i-lucide-calendar-days',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Study Plan',
  icon: 'i-lucide-git-branch',
  to: '/study-plan',
  active: route.path.startsWith('/study-plan'),
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Degrees',
  icon: 'i-lucide-graduation-cap',
  to: '/degrees',
  active: route.path.startsWith('/degrees'),
  defaultOpen: false,
  onSelect: () => {
    open.value = false
  },
  children: degreesChildren.value
}, {
  label: 'Classes',
  icon: 'i-lucide-book-text',
  to: '/classes',
  active: route.path.startsWith('/classes'),
  defaultOpen: false,
  onSelect: () => {
    open.value = false
  },
  children: classesChildren.value
}, {
  label: 'Clubs',
  icon: 'i-lucide-users',
  to: '/clubs',
  active: route.path.startsWith('/clubs'),
  defaultOpen: false,
  onSelect: () => {
    open.value = false
  },
  children: clubsChildren.value
}, {
  label: 'Detention',
  icon: 'i-lucide-angry',
  to: '/detention',
  active: route.path.startsWith('/detention'),
  defaultOpen: false,
  onSelect: () => {
    open.value = false
  },
  children: punishmentsChildren.value
}, {
  label: 'Teachers',
  icon: 'i-lucide-presentation',
  to: '/teachers',
  active: route.path.startsWith('/teachers'),
  defaultOpen: false,
  onSelect: () => {
    open.value = false
  },
  children: facultyChildren.value
}, {
  label: 'Students',
  icon: 'i-lucide-users',
  to: '/students',
  active: route.path.startsWith('/students'),
  defaultOpen: false,
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Library',
  icon: 'i-lucide-library',
  to: '/library',
  active: route.path.startsWith('/library'),
  defaultOpen: false,
  onSelect: () => {
    open.value = false
  },
  children: [
    {
      label: 'All Media',
      to: '/library',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Videos',
      to: '/library/videos',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Images',
      to: '/library/images',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Audio',
      to: '/library/audio',
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Books',
      to: '/library/books',
      onSelect: () => {
        open.value = false
      }
    }
  ]
}, {
  label: 'Flashcards',
  icon: 'i-lucide-playing-cards-fan',
  to: '/flashcards',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Activities',
  icon: 'i-lucide-dumbbell',
  to: '/activities',
  active: route.path.startsWith('/activities'),
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Metrics',
  icon: 'i-lucide-chart-no-axes-combined',
  to: '/metrics',
  active: route.path.startsWith('/metrics'),
  onSelect: () => {
    open.value = false
  }
}]] satisfies NavigationMenuItem[][])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat()
}])
</script>
