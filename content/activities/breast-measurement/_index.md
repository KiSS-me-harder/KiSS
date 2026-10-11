---
title: "Breast Measurement"
description: "Record your current breast measurements. Track changes over time as your body develops."
longDescription: "Record your current breast measurements to track changes over time as your body develops through training. Consistent measurement helps you monitor the effects of your body development routine and see gradual progress. Measure at the same time of day under similar conditions for the most reliable data. This gives you a clear picture of how your physical transformation is progressing."
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
