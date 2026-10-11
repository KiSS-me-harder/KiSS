---
title: "Double Penetration Practice"
description: "Practice taking two objects simultaneously. Record the sizes of both objects."
icon: "i-lucide-split"
category: "Anal Training"
fields:
  - id: "primary_girth"
    label: "Primary Girth"
    unit: "cm"
    icon: "i-lucide-circle"
    required: true
  - id: "secondary_girth"
    label: "Secondary Girth"
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
      primary_girth: "girth"
  - metric: "anal-endurance"
    map:
      duration: "penetrationDuration"
---
