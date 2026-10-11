---
title: "Hypnosis Videos"
description: "Watch hypnosis training videos to increase your suggestibility and brainwashing level."
longDescription: "Watch hypnosis training videos to increase your suggestibility and deepen your brainwashing level. Record the duration of your session to track your exposure over time. Regular hypnosis practice can help reinforce submission patterns and mental conditioning. Find a comfortable, quiet environment where you won't be disturbed during your session."
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
