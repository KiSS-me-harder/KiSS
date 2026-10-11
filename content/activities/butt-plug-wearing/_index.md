---
title: "Butt Plug Wearing"
description: "Wear an anal plug for an extended period. Record the plug size and how long you wore it."
longDescription: "Wear an anal plug for an extended period to build anal endurance and stretch capacity. Record the plug's girth and how long you wore it to track your progress over time. Start with smaller plugs and shorter durations, gradually increasing both as your comfort and tolerance improve. This activity contributes to both your anal-stretch and anal-endurance metrics, helping you build the foundation for more advanced training."
icon: "i-lucide-circle"
category: "Anal Training"
fields:
  - id: "girth"
    label: "Plug Girth"
    unit: "cm"
    icon: "i-lucide-circle"
    required: true
  - id: "duration"
    label: "Wear Time"
    unit: "min"
    icon: "i-lucide-clock"
    required: true
contributions:
  - metric: "anal-stretch"
    map:
      girth: "girth"
  - metric: "anal-endurance"
    map:
      duration: "wearDuration"
---
