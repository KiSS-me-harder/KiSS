<template>
  <!-- Icon logo (collapsed) -->
  <svg
    v-if="collapsed && isDark"
    viewBox="0 0 65.915628 65.915656"
    class="app-logo app-logo--icon h-13"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(-231.4691,79.972762)">
      <rect
        style="fill:#09090b;stroke:#3f3f46;stroke-width:1;stroke-linecap:round;stroke-linejoin:round"
        width="65.915649"
        height="65.915649"
        x="231.46909"
        y="-79.972755"
        ry="16.776207"
      />
      <text style="font-weight:bold;font-size:47.7356px;font-family:'Audiowide';fill:var(--ui-primary);stroke-width:3.56204;stroke-linecap:round;stroke-linejoin:round" x="243.36775" y="-30.302797">K</text>
    </g>
  </svg>
  <svg
    v-else-if="collapsed"
    viewBox="0 0 65.91564 65.915648"
    class="app-logo app-logo--icon h-13"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(-231.30836,157.82117)">
      <rect
        style="fill:#f0f0f3;stroke:#d8d8df;stroke-width:1;stroke-linecap:round;stroke-linejoin:round"
        width="65.915649"
        height="65.915649"
        x="231.30836"
        y="-157.82117"
        ry="16.776207"
      />
      <text style="font-weight:bold;font-size:47.7356px;font-family:'Audiowide';fill:var(--ui-primary);stroke-width:3.56204;stroke-linecap:round;stroke-linejoin:round" x="243.20705" y="-108.1512">K</text>
    </g>
  </svg>

  <!-- Wide logo (expanded) -->
  <svg
    v-else-if="isDark"
    viewBox="0 0 149.18352 65.915648"
    class="app-logo app-logo--wide h-13"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(-307.53637,80.421988)">
      <text style="font-weight:bold;font-size:47.7356px;font-family:'Audiowide';fill:#ffffff;stroke-width:3.56204;stroke-linecap:round;stroke-linejoin:round" x="319.43506" y="-30.752031">K<tspan style="fill:var(--ui-primary)">i</tspan>SS</text>
    </g>
  </svg>
  <svg
    v-else
    viewBox="0 0 149.18352 65.91564"
    class="app-logo app-logo--wide h-13"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(-307.37569,158.2704)">
      <text style="font-weight:bold;font-size:47.7356px;font-family:'Audiowide';stroke-width:3.56204;stroke-linecap:round;stroke-linejoin:round" x="319.27432" y="-108.60043"><tspan style="fill:#000000">K</tspan><tspan style="fill:var(--ui-primary)">i</tspan><tspan style="fill:#000000">SS</tspan></text>
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
</script>

<style scoped>
.app-logo {
  transform-origin: center;
  transition:
      transform 200ms ease-out,
      filter 200ms ease-out;
}

@media (hover: hover) {
  .app-logo--icon:hover {
    transform: translateY(-1px) scale(1.03);
    filter: brightness(1.08);
  }

  .app-logo--wide:hover {
    transform: translateY(-1px) scale(1.015);
    filter: brightness(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-logo {
    transition: none;
  }
}
</style>
