/**
 * Preset configurations for the Spiral Visuals Creator.
 * Each preset defines a named collection of layers with specific templates, colors, sizes, speeds, directions, and intensity values.
 */

import type { SpiralLayer } from '../components/tools/SpiralLayers.vue'

export interface SpiralPreset {
  name: string
  icon: string
  layers: Omit<SpiralLayer, 'id' | 'angle'>[]
}

export const presets: SpiralPreset[] = [
  { name: 'Classic', icon: 'i-lucide-aperture', layers: [
    { template: 'classic', color: 'primary', size: 100, speed: 50, direction: 'forward', intensity: 1 },
    { template: 'classic', color: 'secondary', size: 70, speed: 35, direction: 'backward', intensity: 2 },
    { template: 'concentric', color: 'neutral', size: 130, speed: 20, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Double Spiral', icon: 'i-lucide-git-merge', layers: [
    { template: 'double', color: 'secondary', size: 100, speed: 30, direction: 'forward', intensity: 2 },
    { template: 'double', color: 'primary', size: 80, speed: 25, direction: 'backward', intensity: 2 },
    { template: 'classic', color: 'info', size: 120, speed: 15, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Wave', icon: 'i-lucide-wave-sine', layers: [
    { template: 'wave', color: 'info', size: 120, speed: 40, direction: 'forward', intensity: 1 },
    { template: 'wave', color: 'primary', size: 90, speed: 30, direction: 'backward', intensity: 1 },
    { template: 'wave', color: 'success', size: 150, speed: 20, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Concentric', icon: 'i-lucide-circle-dot', layers: [
    { template: 'concentric', color: 'neutral', size: 60, speed: 20, direction: 'forward', intensity: 1 },
    { template: 'concentric', color: 'primary', size: 100, speed: 15, direction: 'backward', intensity: 1 },
    { template: 'concentric', color: 'secondary', size: 140, speed: 10, direction: 'forward', intensity: 1 },
    { template: 'mandala', color: 'info', size: 180, speed: 5, direction: 'forward', intensity: 4 }
  ] },
  { name: 'Multi-Arm', icon: 'i-lucide-flower', layers: [
    { template: 'classic', color: 'warning', size: 100, speed: 60, direction: 'forward', intensity: 6 },
    { template: 'classic', color: 'error', size: 70, speed: 45, direction: 'backward', intensity: 4 },
    { template: 'starburst', color: 'primary', size: 130, speed: 30, direction: 'forward', intensity: 8 }
  ] },
  { name: 'Chaos', icon: 'i-lucide-flare', layers: [
    { template: 'classic', color: 'error', size: 80, speed: 80, direction: 'forward', intensity: 8 },
    { template: 'wave', color: 'warning', size: 120, speed: 40, direction: 'backward', intensity: 4 },
    { template: 'fractal', color: 'primary', size: 60, speed: 90, direction: 'forward', intensity: 5 },
    { template: 'starburst', color: 'info', size: 150, speed: 60, direction: 'backward', intensity: 6 }
  ] },
  { name: 'Layered', icon: 'i-lucide-layers', layers: [
    { template: 'classic', color: 'primary', size: 50, speed: 40, direction: 'forward', intensity: 1 },
    { template: 'classic', color: 'secondary', size: 80, speed: 30, direction: 'backward', intensity: 1 },
    { template: 'classic', color: 'info', size: 110, speed: 20, direction: 'forward', intensity: 1 },
    { template: 'classic', color: 'success', size: 140, speed: 10, direction: 'backward', intensity: 1 }
  ] },
  { name: 'Hypnotic', icon: 'i-lucide-eye', layers: [
    { template: 'concentric', color: 'primary', size: 60, speed: 15, direction: 'forward', intensity: 1 },
    { template: 'classic', color: 'secondary', size: 90, speed: 25, direction: 'backward', intensity: 3 },
    { template: 'concentric', color: 'neutral', size: 120, speed: 10, direction: 'forward', intensity: 1 },
    { template: 'mandala', color: 'info', size: 150, speed: 8, direction: 'backward', intensity: 6 }
  ] },
  { name: 'Galaxy', icon: 'i-lucide-star', layers: [
    { template: 'galaxy', color: 'info', size: 150, speed: 10, direction: 'forward', intensity: 4 },
    { template: 'galaxy', color: 'primary', size: 120, speed: 8, direction: 'backward', intensity: 6 },
    { template: 'concentric', color: 'neutral', size: 80, speed: 5, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Zen', icon: 'i-lucide-circle', layers: [
    { template: 'mandala', color: 'success', size: 80, speed: 10, direction: 'forward', intensity: 3 },
    { template: 'mandala', color: 'primary', size: 120, speed: 7, direction: 'backward', intensity: 5 },
    { template: 'concentric', color: 'neutral', size: 160, speed: 4, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Vortex', icon: 'i-lucide-tornado', layers: [
    { template: 'vortex', color: 'error', size: 120, speed: 60, direction: 'forward', intensity: 4 },
    { template: 'double', color: 'warning', size: 80, speed: 70, direction: 'backward', intensity: 2 },
    { template: 'classic', color: 'primary', size: 60, speed: 50, direction: 'forward', intensity: 3 }
  ] },
  { name: 'Prism', icon: 'i-lucide-palette', layers: [
    { template: 'kaleidoscope', color: 'primary', size: 100, speed: 20, direction: 'forward', intensity: 3 },
    { template: 'kaleidoscope', color: 'secondary', size: 70, speed: 15, direction: 'backward', intensity: 3 },
    { template: 'kaleidoscope', color: 'warning', size: 130, speed: 10, direction: 'forward', intensity: 4 }
  ] },
  { name: 'Fractal', icon: 'i-lucide-tree-deciduous', layers: [
    { template: 'fractal', color: 'success', size: 80, speed: 15, direction: 'forward', intensity: 3 },
    { template: 'fractal', color: 'primary', size: 120, speed: 10, direction: 'backward', intensity: 4 },
    { template: 'classic', color: 'info', size: 60, speed: 20, direction: 'forward', intensity: 2 }
  ] },
  { name: 'Helix', icon: 'i-lucide-dna', layers: [
    { template: 'helix', color: 'info', size: 100, speed: 30, direction: 'forward', intensity: 1 },
    { template: 'helix', color: 'primary', size: 100, speed: 25, direction: 'backward', intensity: 1 },
    { template: 'dna', color: 'success', size: 80, speed: 20, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Starburst', icon: 'i-lucide-burst', layers: [
    { template: 'starburst', color: 'warning', size: 100, speed: 25, direction: 'forward', intensity: 3 },
    { template: 'starburst', color: 'error', size: 70, speed: 35, direction: 'backward', intensity: 5 },
    { template: 'classic', color: 'primary', size: 130, speed: 15, direction: 'forward', intensity: 1 }
  ] },
  { name: 'DNA', icon: 'i-lucide-dna', layers: [
    { template: 'dna', color: 'primary', size: 100, speed: 20, direction: 'forward', intensity: 1 },
    { template: 'dna', color: 'error', size: 100, speed: 20, direction: 'backward', intensity: 1 },
    { template: 'helix', color: 'info', size: 80, speed: 15, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Meditation', icon: 'i-lucide-moon', layers: [
    { template: 'concentric', color: 'primary', size: 60, speed: 3, direction: 'forward', intensity: 1 },
    { template: 'mandala', color: 'neutral', size: 100, speed: 2, direction: 'backward', intensity: 4 },
    { template: 'concentric', color: 'secondary', size: 140, speed: 1, direction: 'forward', intensity: 1 },
    { template: 'classic', color: 'info', size: 180, speed: 1, direction: 'backward', intensity: 1 }
  ] },
  { name: 'Neon', icon: 'i-lucide-zap', layers: [
    { template: 'starburst', color: 'error', size: 100, speed: 50, direction: 'forward', intensity: 6 },
    { template: 'classic', color: 'warning', size: 60, speed: 40, direction: 'backward', intensity: 2 },
    { template: 'starburst', color: 'primary', size: 130, speed: 30, direction: 'forward', intensity: 4 }
  ] },
  { name: 'Spiral Galaxy', icon: 'i-lucide-cloud-lightning', layers: [
    { template: 'galaxy', color: 'primary', size: 150, speed: 8, direction: 'forward', intensity: 6 },
    { template: 'galaxy', color: 'info', size: 120, speed: 12, direction: 'backward', intensity: 4 },
    { template: 'starburst', color: 'warning', size: 80, speed: 15, direction: 'forward', intensity: 8 }
  ] },
  { name: 'Kaleido Wave', icon: 'i-lucide-scissors', layers: [
    { template: 'kaleidoscope', color: 'success', size: 100, speed: 25, direction: 'forward', intensity: 4 },
    { template: 'wave', color: 'info', size: 80, speed: 35, direction: 'backward', intensity: 1 },
    { template: 'kaleidoscope', color: 'primary', size: 120, speed: 15, direction: 'forward', intensity: 3 }
  ] },
  { name: 'Fractal Garden', icon: 'i-lucide-leaf', layers: [
    { template: 'fractal', color: 'success', size: 80, speed: 10, direction: 'forward', intensity: 4 },
    { template: 'fractal', color: 'primary', size: 120, speed: 8, direction: 'backward', intensity: 3 },
    { template: 'mandala', color: 'info', size: 150, speed: 5, direction: 'forward', intensity: 6 }
  ] },
  { name: 'Helix Dance', icon: 'i-lucide-music', layers: [
    { template: 'helix', color: 'primary', size: 100, speed: 40, direction: 'forward', intensity: 1 },
    { template: 'helix', color: 'secondary', size: 100, speed: 35, direction: 'backward', intensity: 1 },
    { template: 'dna', color: 'warning', size: 80, speed: 30, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Tunnel Vision', icon: 'i-lucide-target', layers: [
    { template: 'vortex', color: 'neutral', size: 150, speed: 50, direction: 'forward', intensity: 6 },
    { template: 'concentric', color: 'primary', size: 80, speed: 30, direction: 'forward', intensity: 1 },
    { template: 'vortex', color: 'error', size: 120, speed: 40, direction: 'backward', intensity: 4 }
  ] },
  { name: 'Cosmic', icon: 'i-lucide-space', layers: [
    { template: 'galaxy', color: 'secondary', size: 200, speed: 5, direction: 'forward', intensity: 8 },
    { template: 'starburst', color: 'warning', size: 100, speed: 15, direction: 'backward', intensity: 6 },
    { template: 'concentric', color: 'neutral', size: 60, speed: 10, direction: 'forward', intensity: 1 },
    { template: 'classic', color: 'primary', size: 140, speed: 8, direction: 'backward', intensity: 2 }
  ] },
  { name: 'Rainbow', icon: 'i-lucide-rainbow', layers: [
    { template: 'classic', color: 'error', size: 50, speed: 30, direction: 'forward', intensity: 1 },
    { template: 'classic', color: 'warning', size: 75, speed: 25, direction: 'backward', intensity: 1 },
    { template: 'classic', color: 'success', size: 100, speed: 20, direction: 'forward', intensity: 1 },
    { template: 'classic', color: 'info', size: 125, speed: 15, direction: 'backward', intensity: 1 }
  ] },
  { name: 'Pendulum', icon: 'i-lucide-compass', layers: [
    { template: 'double', color: 'primary', size: 100, speed: 15, direction: 'forward', intensity: 2 },
    { template: 'double', color: 'secondary', size: 100, speed: 15, direction: 'backward', intensity: 2 },
    { template: 'concentric', color: 'neutral', size: 140, speed: 8, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Mandala Burst', icon: 'i-lucide-sun', layers: [
    { template: 'mandala', color: 'warning', size: 100, speed: 20, direction: 'forward', intensity: 6 },
    { template: 'starburst', color: 'error', size: 80, speed: 30, direction: 'backward', intensity: 6 },
    { template: 'mandala', color: 'primary', size: 130, speed: 12, direction: 'forward', intensity: 4 }
  ] },
  { name: 'Deep Focus', icon: 'i-lucide-brain', layers: [
    { template: 'concentric', color: 'info', size: 60, speed: 5, direction: 'forward', intensity: 1 },
    { template: 'mandala', color: 'primary', size: 100, speed: 3, direction: 'backward', intensity: 3 },
    { template: 'classic', color: 'neutral', size: 140, speed: 2, direction: 'forward', intensity: 1 },
    { template: 'concentric', color: 'secondary', size: 180, speed: 1, direction: 'backward', intensity: 1 }
  ] },
  { name: 'Lightning', icon: 'i-lucide-bolt', layers: [
    { template: 'fractal', color: 'warning', size: 100, speed: 100, direction: 'forward', intensity: 5 },
    { template: 'starburst', color: 'error', size: 120, speed: 80, direction: 'backward', intensity: 8 },
    { template: 'classic', color: 'primary', size: 60, speed: 120, direction: 'forward', intensity: 3 }
  ] },
  { name: 'Ocean', icon: 'i-lucide-anchor', layers: [
    { template: 'wave', color: 'info', size: 100, speed: 20, direction: 'forward', intensity: 1 },
    { template: 'wave', color: 'primary', size: 130, speed: 15, direction: 'backward', intensity: 1 },
    { template: 'concentric', color: 'neutral', size: 80, speed: 10, direction: 'forward', intensity: 1 },
    { template: 'wave', color: 'success', size: 160, speed: 8, direction: 'backward', intensity: 1 }
  ] },
  { name: 'DNA Twist', icon: 'i-lucide-refresh-cw', layers: [
    { template: 'dna', color: 'success', size: 100, speed: 50, direction: 'forward', intensity: 1 },
    { template: 'helix', color: 'info', size: 100, speed: 40, direction: 'backward', intensity: 1 },
    { template: 'dna', color: 'primary', size: 80, speed: 35, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Kaleido Fractal', icon: 'i-lucide-shapes', layers: [
    { template: 'kaleidoscope', color: 'primary', size: 100, speed: 15, direction: 'forward', intensity: 3 },
    { template: 'fractal', color: 'warning', size: 80, speed: 20, direction: 'backward', intensity: 4 },
    { template: 'kaleidoscope', color: 'success', size: 120, speed: 10, direction: 'forward', intensity: 5 }
  ] },
  { name: 'Eclipse', icon: 'i-lucide-sun-moon', layers: [
    { template: 'concentric', color: 'neutral', size: 100, speed: 10, direction: 'forward', intensity: 1 },
    { template: 'vortex', color: 'error', size: 60, speed: 40, direction: 'backward', intensity: 2 },
    { template: 'concentric', color: 'primary', size: 140, speed: 5, direction: 'forward', intensity: 1 }
  ] },
  { name: 'Fireworks', icon: 'i-lucide-sparkles', layers: [
    { template: 'starburst', color: 'warning', size: 100, speed: 60, direction: 'forward', intensity: 8 },
    { template: 'starburst', color: 'error', size: 70, speed: 50, direction: 'backward', intensity: 6 },
    { template: 'classic', color: 'primary', size: 50, speed: 70, direction: 'forward', intensity: 3 },
    { template: 'starburst', color: 'info', size: 130, speed: 40, direction: 'backward', intensity: 4 }
  ] },
  { name: 'Aurora', icon: 'i-lucide-cloud-rain', layers: [
    { template: 'wave', color: 'success', size: 120, speed: 10, direction: 'forward', intensity: 1 },
    { template: 'wave', color: 'info', size: 100, speed: 8, direction: 'backward', intensity: 1 },
    { template: 'wave', color: 'primary', size: 80, speed: 12, direction: 'forward', intensity: 1 },
    { template: 'concentric', color: 'neutral', size: 150, speed: 5, direction: 'backward', intensity: 1 }
  ] }
]
