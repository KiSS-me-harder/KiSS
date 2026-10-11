---
title: "Hypnosis Videos"
description: "Watch hypnosis training videos to increase your suggestibility and brainwashing level."
icon: "i-lucide-brain"
category: "Mental Training"
fields:
  - id: "videos"
    label: "Videos Watched"
    unit: "count"
    icon: "i-lucide-video"
    required: true
  - id: "duration"
    label: "Duration"
    unit: "min"
    icon: "i-lucide-clock"
    required: true
  - id: "depth"
    label: "Trance Depth"
    unit: "score"
    icon: "i-lucide-gauge"
    required: false
contributions:
  - metric: "brainwashing"
    map:
      videos: "videosWatched"
      duration: "sessionDuration"
      depth: "suggestibility"
---
