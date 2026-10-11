---
title: "Breast Measurement"
description: "Record your current breast measurements. Track changes over time as your body develops."
icon: "i-lucide-heart"
category: "Body Development"
fields:
  - id: "bust"
    label: "Bust Circumference"
    unit: "cm"
    icon: "i-lucide-ruler"
    required: true
  - id: "underbust"
    label: "Underbust Circumference"
    unit: "cm"
    icon: "i-lucide-ruler"
    required: true
contributions:
  - metric: "body-shape"
    map:
      bust: "bust"
      underbust: "waist"
---
