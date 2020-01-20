---
title: "Site Redesign"
date: 2019-11-25T16:53:09-05:00
publishDate: 2019-11-25
archives: "2019"
drafts: true
tags: [ "site" ]
resources:
    - name: hero
      src: nails-4607202_1280.jpg
      title: "Hammer and Nails"
      params:
        credits:
            Image by <a href="https://pixabay.com/users/analogicus-8164369/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4607202">analogicus</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=4607202">Pixabay</a>
---

The site is a year old, so of course, a redesign is needed. New looks, New
comments, and more.
<!--more-->

## Theme Change

The [old theme](https://github.com/mhhollomon/hugo-theme-vellichor) was built
on the [Bulma](https://Bulma.io/) framework. Bulma is quite versatile and that
makes it very easy to put together some very nice websites. I found it quite
nice to work with when I was putting together the original version of this
blog.

However, some of the tweaks I wanted to do (reduce some of the margins) would
have required me to download the SCSS sources and regenerate the framework
after changing constants, etc. I wasn't really looking forward to essentially
maintaining my own version of the framework. If I had been making something
with a few hundred pages for a corporate website, then absolutely it would
have been a fine thing to do.

Looking at the themes on the [Hugo Theme Showcase
Website](https://themes.gohugo.io) I came across the [Hugo Minimalist
Theme](https://github.com/digitalcraftsman/hugo-minimalist-theme). This seemed
to do what I wanted without using a framework.

So, the redesign was in flight.

## Comments

The original design used [Utterances](https://utteranc.es/) which stored
comments as issues in [Github](https://www.github.com). This worked fine but
required the commenter to be a member of github.

Now I've switched to [Commentbox](https://www.commentbox.io). This allows
sign-in by various social media accounts.

## TODO

I still need to change the favicon. The current horrid mess must go.

![Current favicon](/fav/android-chrome-192x192.png)

Anybody want to volunteer to create a new one?
