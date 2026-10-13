<template>
  <div class="space-y-6">
    <HomeTodayStats />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <HomeTodaySchedule />
      <HomeTodayTasks />
    </div>

    <HomeTodayRecommendations />
  </div>
</template>
