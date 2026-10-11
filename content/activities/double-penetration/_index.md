---
title: "Double Penetration Practice"
description: "Practice taking two objects simultaneously. Record the sizes of both objects."
longDescription: "Practice taking two objects simultaneously to build advanced stretch capacity and control. Record the sizes of both objects to track your progression. This is an advanced activity that requires a strong foundation in basic stretch training. Proceed carefully and gradually, ensuring proper lubrication and relaxation techniques."
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
