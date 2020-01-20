---
title: "Getting purgecss to read from stdin"
date: 2020-01-04T07:25:13-05:00
publishDate: 2020-01-06
archives: "2020"
tags: ["purgecss", "nodejs", "gist"]
summary: "Small wrapper to run [purgecss](https://www.purgecss.org) on css from stdin."
cvtype: "blog"
---

The purgecss CLI does not (currently) read css from stdin. Here is a short node
script to make that happen.

The command line looks like:

```bash
purgecss_stdin <output file>
```

If no output file is given, it writes to stdout.

It will automatically read a `purgecss.config.js` file if it is available.

A usage example:

```bash
npx tailwind build src/css/styles.css | purgecss_stdin build/dist/styles.css
```

{{< gist mhhollomon 8a9d382a7e6b1e45345a9b06b21f49db >}}



