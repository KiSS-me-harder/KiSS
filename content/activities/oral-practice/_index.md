---
title: "Oral Practice"
description: "Practice oral service skills. Record your endurance time and depth achieved."
longDescription: "Practice oral service skills to improve your technique and build endurance. Record your endurance time and depth achieved to track your progress. Focus on both quality and duration, working on relaxation and control techniques. This activity contributes to both your oral-depth and oral-endurance metrics."
icon: "i-lucide-mic"
category: "Oral Training"
fields:
  - id: "endurance"
    label: "Endurance Time"
    unit: "min"
    icon: "i-lucide-clock"
    required: true
  - id: "depth"
    label: "Depth"
    unit: "cm"
    icon: "i-lucide-arrow-down"
    required: false
contributions:
  - metric: "oral-training"
    map:
      endurance: "endurance"
      depth: "depth"
---
