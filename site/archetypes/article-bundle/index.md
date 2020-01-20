---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
publishDate: {{ dateFormat "2006-01-02" now }}
archives: "{{ dateFormat "2006" now }}"
draft: true
tags: []
cvtype: "article"
resources:
    - name: hero
      src: "<image filename>"
      title: "<image title>"
      params:
        credits:
            Markdown image credits
---
