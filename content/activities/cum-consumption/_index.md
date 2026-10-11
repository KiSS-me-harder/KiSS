---
title: "Cum Consumption"
description: "Consume cum and record the volume. Track your daily and maximum single-session intake."
longDescription: "Consume cum and record the volume to track your daily and maximum single-session intake. This activity helps build desensitization and submission through regular practice. Monitor your progress over time to see how your tolerance and comfort level develop. This contributes to your desensitization metric, tracking your overall capacity."
icon: "i-lucide-droplet"
category: "Oral Training"
fields:
  - id: "volume"
    label: "Volume"
    unit: "ml"
    icon: "i-lucide-droplet"
    required: true
  - id: "loads"
    label: "Number of Loads"
    unit: "loads"
    icon: "i-lucide-hash"
    required: false
contributions:
  - metric: "cum-tolerance"
    map:
      volume: "dailyVolume"
      volume: "maxVolume"
      loads: "loads"
---
