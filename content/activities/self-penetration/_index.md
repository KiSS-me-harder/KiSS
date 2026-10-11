---
title: "Self Penetration"
description: "Penetrate yourself with a dildo or similar toy. Record the dimensions and duration."
longDescription: "Penetrate yourself with a dildo or similar toy to build internal stretch capacity and control. Record the dimensions of the toy and the duration to track your progress over time. Use plenty of lubrication and go slowly, listening to your body. This activity contributes to both your anal-stretch and anal-endurance metrics."
icon: "i-lucide-scala"
category: "Anal Training"
fields:
  - id: "length"
    label: "Length"
    unit: "cm"
    icon: "i-lucide-ruler"
    required: true
  - id: "girth"
    label: "Girth"
    unit: "cm"
    icon: "i-lucide-circle"
    required: true
  - id: "duration"
    label: "Duration"
    unit: "min"
    icon: "i-lucide-clock"
    required: false
contributions:
  - metric: "anal-stretch"
    map:
      length: "length"
      girth: "girth"
  - metric: "anal-endurance"
    map:
      duration: "penetrationDuration"
---
