---
name: Feature request
about: Suggest an idea for this project
title: ''
labels: ''
assignees: ''

---

name: "✨ Feature"
description: "새로운 기능 요청"
title: "[Feat]: "
labels: ["feat"]
body:
  - type: textarea
    id: description
    attributes:
      label: 설명
      placeholder: 어떤 기능인가요?
    validations:
      required: true
  - type: dropdown
    id: part
    attributes:
      label: 파트
      options:
        - Frontend
        - Backend
        - Full Stack
    validations:
      required: true
  - type: textarea
    id: tasks
    attributes:
      label: 작업 목록
      value: |
        - [ ]
