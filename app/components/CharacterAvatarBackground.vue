<template>
  <div class="absolute inset-0">
    <div class="absolute top-4 left-1/2 -translate-x-1/2 w-[85%] h-[35%] rounded-lg bg-emerald-900/80 border-4 border-amber-900/60 shadow-lg">
      <div class="absolute inset-2 flex items-center justify-center gap-4 opacity-30">
        <div class="text-white/40 text-2xl">
          👗
        </div>
        <div class="text-white/40 text-2xl">
          👠
        </div>
        <div class="text-white/40 text-2xl">
          💄
        </div>
        <div class="text-white/40 text-2xl">
          🎀
        </div>
        <div class="text-white/40 text-2xl">
          💅
        </div>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/[0.02] to-transparent" />
    </div>
    <div class="absolute bottom-[30%] right-6 w-[25%] h-[15%] rounded bg-amber-900/40 border border-amber-800/30">
      <div class="absolute top-1 left-1 right-1 h-[40%] rounded-sm bg-amber-800/20" />
    </div>
    <div class="absolute bottom-[25%] right-[18%] w-1 h-[5%] bg-amber-900/30" />
    <div class="absolute bottom-[25%] right-[8%] w-1 h-[5%] bg-amber-900/30" />
    <div class="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-amber-950/30 to-transparent" />
    <div class="absolute bottom-0 left-0 right-0 h-[30%]">
      <div
        v-for="i in 5"
        :key="i"
        class="absolute left-0 right-0 h-px bg-amber-900/10"
        :style="{ bottom: `${i * 6}%` }"
      />
    </div>
    <div class="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-bl from-white/[0.03] to-transparent" />
  </div>
</template>
