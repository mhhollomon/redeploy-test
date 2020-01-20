---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
publishDate: {{ dateFormat "2006-01-02" now }}
archives: "{{ dateFormat "2006" now }}"
drafts: true
tags: []
cvtype: "article"
resources:
    - name: hero
      src: "<image name here>"
      title: "<title here>"
      params:
        credits: "<Markdown credit string here>"
---
