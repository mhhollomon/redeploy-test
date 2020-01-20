---
title: "Comment Systems for Static Websites"
date: 2018-12-21T08:40:22-05:00
publishDate: "2018-12-30"
description: "A listing of comment systems for use with static websites"
tags: ["Website Tech"]
aliases :
    - /2018/12/comment-systems-for-static-websites
resources:
    - name: hero
      src: "cms-265128_1280.jpg"
      title : "Comments"
      params:
        credits: "Image by [Werner Moser](https://pixabay.com/users/pixelcreatures-127599/) from [Pixabay](https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=265128)"
---

(**Updated 2019-12-18**)

Static websites are fast and tend to be simple to maintain. But the lack of
processing on the server side means that comments (and other interaction) is a
bit of a hassle. 

This is a list - by no means complete - of the systems for doing comments on a
static website. 

<!--more-->
For each system, I try to give a neutral description. Afterwards, in italics,
I've given my very subjective opinions. Those should be taken with a grain of
salt.

In all cases, I will be approaching this from the point of view of a small,
reasonably low volume website such as a personal blog, or the like.

I expect to continue to add to this list as I have time. Please see the
References at the end for other lists.

Note: The below list is in alphabetical order.

CaaS = Comment as a service

{{< raw-html >}}
<table class="spare_table">
<thead>
<tr><th>System</th><th>Description</th></tr>
</thead>
<tbody>
<tr>
    <td>
        <a href="https://commento.io/">Commento</a>
        <br><a href="https://gitlab.com/commento">Open Source</a>
        <br><a href="https://commento.io/">CaaS</a>
    </td>
    <td> Hosted with Up to
    50,000 page views per month for about 5$/month. Or DIY hosting. No free tier.
    But makes promises about privacy. Full OAuth support, so google, etc.
    Integrates with Akismet.
    Possible to integrate with your own auth system.
    Page id can be specified as part of &lt;script&gt; tag.
    </td>
</tr>
<tr>
    <td>
        <a href="https://commentbox.io/">CommentBox</a>
        <br>Closed Source
    </td>
    <td>Free plan allows 100 comments per month (but unlimited views). Page to 
    comment linkage can be specified in the Javascript.
    <br>[<i>One of the nicer privacy policy pages. Penalty for going over the
    free limit is pretty steep. This is what I am using, currently.</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https:/disqus.com">Disqus</a>
        <br>Closed Source
    </td>
    <td>Probably the best known of the services. Free, but ad-based. Comment
    data resides in their servers. User authentication is done. The user can
    sign-up using a Google account, A Facebook account, or an email and
    password.  The user's identity will follow to all sites using Disqus.
    <br>[<i>Lots of privacy concerns. And the <b>types</b> of ads are also
    concerning.</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https:/discourse.org">Discourse</a>
        <br><a href="https://github.com/discourse/discourse">Open Source</a>
        <br><a href="https:/discourse.org">CaaS</a>
    </td>
    <td>Login can be integrated with most social sites. There is a really comprehensive api for
    automating tasks or keeping stats. Your hosting choices are
        <ul>
        <li>Host it yourself</li>
        <li>Pay Discourse to install it on <a
        href="https://www.digitalocean.com/">Digital Ocean</a> -  no support after
        the install</li>
        <li>Pay Discourse to host it</li>
            <ul><li>The lowest hosted plan is $100/month.</li></ul>
        </ul>
</tr>
<tr>
    <td>
        <a href="https://developers.facebook.com/docs/plugins/comments/">Facebook Comments</a>
        <br>Closed Source</a>
    </td>
    <td>Yes, you can have Facebook do your comments. Integrates with the rest
    of the Facebook ecosystem. Free for use.
    <br>[<i>No other OAuth providers need apply</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://github.com/imsun/gitment">Gitment</a>
        <br><a href="https://github.com/imsun/gitment">Open Source</a>
    </td>
    <td>Stores comments as github issues similar to utterances. However, there
    is no back-end. All communication with github takes place from the browser. You 
    have to initialize each page as it is published.
    <br>[<i>Utterances wears it better</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://graphcomment.com/en/">GraphComment</a>
        <br>Closed Source
    </td>
    <td>Free up to a million page views. Integrates login with social sites.
    Has support to do sharing without redirection to the GraphComment servers.
    The free tier spam filtering is all manual. 
    <br>[<i>Unconfirmed, but some sources say it injects a Facebook script.</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://intensedebate.com/home">IntenseDebate</a>
        <br>Closed Source
    </td>
    <td>By Automattic - the company behind Wordpress.Com (not org) and Akismet.
    Like Disqus, it is free for use.
    <br>[<i>Sorry can't take that name seriously. Comments around the seem to
    say it hasn't seen any development in last few years. </i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://posativ.org/isso/">isso</a>
        <br><a href="https://github.com/posativ/isso">Open Source</a>
    </td>
    <td>Written in python. Comments stored in
    SQLite. You figure out the hosting. Nice docker based install directions.
    <br>[<i>No authentication at all for commenters. Not necessarily a negative</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://just-comments.com/">JustComments</a>
        <br><a href="https://github.com/JustComments">Open Source</a>.
        <br><a href="https://just-comments.com/">CaaS</a>
    </td>
    <td> Integrates login with social sites or you can provide an auth end point
    for them to call.  Anonymous posting is possible, but can be disabled.
    The page id is settable from the html.
    <br>[<i>The description of the pricing is a bit disjointed, but for a small
    website, it looks like it will run $6/month. Do note that the email feature is
    relatively expensive.</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://muut.com/">Muut</a>
        <br>Closed Source
    </td>
    <td>Lowest plan is $16/month.
    <br>[<i>Way more than a simple blog post commenting system</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://remark42.com/">Remark42</a>
        <br><a href="https://github.com/umputun/remark">Open Source</a>
    </td>
    <td>Self-hosted.
    Has integration with many major Social Media sites as well as email login 
    and (configurable) anonymous
    posting. Very complete moderating tools. Page id can be set in the page's
    javascript.
    <br>[<i></i>]
    </td>
<tr>
    <td>
        <a href="https://staticman.net/">StaticMan</a>
        <br><a href="https://github.com/eduardoboucas/staticman">Open Source</a>
    </td>
    <td>Stores comments as text files in your github repository. Has integration
    to Akismet and reCaptcha. It can be used for any interaction with the user.
    This is just a backend. You get to code the submission form and figure out
    how to display the comments. Good
    information on configuring with hugo is <a
    href="https://binarymist.io/blog/2018/02/24/hugo-with-staticman-commenting-and-subscriptions/">
    here</a>.
    <br>[<i>I don't mind the set up work - it only needs to be done once. But
    the actual work binarymist goes through for each post (see comments on the
    post) is a bit much. Can it be automated a bit? Also, <a
    href="https://github.com/eduardoboucas/staticman/issues/243">GitHub
    limits</a></i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://coralproject.net/talk/">Talk by the Coral Project</a>
        <br><a href="https://github.com/coralproject/talk">Open Source</a>
    </td>
    <td>Founded by Mozilla, democracy fund, and others.  For a small
    blog, this would definitely be a DYI process.
    </td>
<tr>
    <td>
        <a href="https://www.talkyard.io/">TalkYard</a>
        <br><a href="https://github.com/debiki/talkyard">Open Source</a> 
        <br><a href="https://www.talkyard.io/">CaaS</a>
    </td>
    <td>Hosted option has a low cost (1 Euro/month) plan for
    100 new comments per month.
    <br>[<i>Assuming this is hosted in Europe, is there a GDPR implications for
    US citizens?</i>]
    </td>
</tr>
<tr>
    <td>
        <a href="https://utteranc.es/">Utterances</a>
        <br><a href="https://github.com/utterance">Open Source</a>
    </td>
    <td>Stores the comments as comments against github issues. Each issue will
    represent the comments for a particular page. You can control association. The
    workflow is done by calling GitHub API in javascript directly from your page.
    <br>[<i>Does require that the commenter be a GitHub user.</i>]
    </td>
</tr>
</tbody>
</table>
{{< /raw-html >}}

## References

- [Hugo comment system
  listing](https://gohugo.io/content-management/comments/#comments-alternatives)
- [Derek Kay blog post](https://darekkay.com/blog/static-site-comments/)
- [Static Man Example Site](https://mademistakes.com/) and the [GitHub
  Repo](https://github.com/mmistakes/made-mistakes-jekyll)
- [List on Shifter.io](https://www.getshifter.io/static-site-comments/)
