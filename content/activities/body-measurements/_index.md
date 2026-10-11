---
title: "Body Measurements"
description: "Record your full body measurements: waist, hips, and thighs. Track your figure development."
longDescription: "Record your full body measurements including waist, hips, and thighs to track your figure development over time. Regular measurements help you see how your training and body development progress is shaping your physique. Take measurements consistently at the same time of day for the most accurate tracking. This activity contributes to your body-shape metric, giving you a quantitative view of how your proportions are evolving."
icon: "i-lucide-ruler"
category: "Body Development"
fields:
  - id: "waist"
    label: "Waist"
    unit: "cm"
    icon: "i-lucide-ruler"
    required: true
  - id: "hips"
    label: "Hips"
    unit: "cm"
    icon: "i-lucide-ruler"
    required: true
  - id: "thighs"
    label: "Thighs"
    unit: "cm"
    icon: "i-lucide-ruler"
    required: false
contributions:
  - metric: "body-shape"
    map:
      waist: "waist"
      hips: "hips"
      thighs: "thighs"
---
