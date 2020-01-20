---
title: "Hugo Layout Matching"
date: 2019-12-01T16:26:32-05:00
publishDate: 2019-12-01
archives: "2019"
draft: true
tags: []
summary:
    Explains (some) of the rules about how hugo decides which layout use for a
    given piece of content.
resources:
    - name: hero
      src: "<image filename>"
      title: "<image title>"
      params:
        credits:
            Image by <a href="https://pixabay.com/users/139904-139904/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=489784">139904</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=489784">Pixabay</a>
---


[Hugo](https://gohugo.io) is both flexible and powerful. This combination can
make it a bit difficult to get a handle on it.

[Hugo's documentation](https://gohugo.io/documentation/) is generally very
good, but is designed to be a reference - which means it shows you *all* the
glorious detail - with all the if, and, buts - up front.

A great example of this is the [Template Lookup
Order](https://gohugo.io/templates/lookup-order/) page. It presents search
order examples with up to 24(!) directories.

Let's see if we can build up to that. We'll look at that search order from the
bottom up.

## The `content` directory drives the process

> Hugo believes that you organize your content with a purpose. The same
> structure that works to organize your source content is used to organize the
> rendered site. [^1]

[^1]: https://gohugo.io/content-management/organization/

Much of what hugo does is driven by the location of the files in your source.
So, to start thing off, lets define a simple web site's content directory.

{{< raw-html >}}
<ul class="dir-list dir-list__dir-cnt">
	<li class="dir-list__entry">
        content
        <ul class="dir-list__dir-cnt">
			<li class="dir-list__entry">
                posts
                <ul class="dir-list__dir-cnt">
                    <li class="dir-list__entry">first-post.md</li>
                    <li class="dir-list__entry">second-post.md</li>
                </ul>
            </li>
			<li class="dir-list__entry">
                news
                <ul class="dir-list__dir-cnt">
                    <li class="dir-list__entry">new-news.md</li>
                    <li class="dir-list__entry">old-news.md</li>
                    <li class="dir-list__entry">older-news.md</li>
                </ul>
            </li>
        </ul>
    </li>
</ul>
{{< /raw-html >}}

There are two different subdirectories `post` and `news` used for different
types of information on the web site. Eventually, we'll want to display them
differently. Each "type"[^2] has a few entries.

[^2]: I place the word "type" in quotes because hugo uses the word with a
  specific meaning. I'm using a more generic meaning here.

## The Three Basic Templates

There are three basic classes of pages that hugo renders - `regular`,
`list`, `home`. Lets look at each in turn.

### "Regular" pages

Where does hugo find the 

### The Home page template

Hugo renders a page that will get served when the user requests the root of
your site e.g. `example.com/`. The template for that can have one of few names:

* index.html - to mirror the name of the file most web servers will look for.
* home.html - 
