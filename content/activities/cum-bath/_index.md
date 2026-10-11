---
title: "Cum Bath"
description: "Take a cum bath or shower. Record the total volume consumed."
icon: "i-lucide-shower-head"
category: "Oral Training"
fields:
  - id: "volume"
    label: "Volume"
    unit: "ml"
    icon: "i-lucide-droplet"
    required: true
  - id: "duration"
    label: "Duration"
    unit: "min"
    icon: "i-lucide-clock"
    required: false
contributions:
  - metric: "cum-tolerance"
    map:
      volume: "maxVolume"
      volume: "dailyVolume"
---
