---
title: "C++20 Interesting Papers"
date: 2019-01-29T12:02:05-05:00
publishDate: 2019-02-18
archives: "2019"
tags: ["C++", "C++20"]
---

Most of the big proposals for C++20 have been talked over quite a bit. But
there are a few "hidden" ones that caught my eye.
<!--more-->

As is normal when talking about "things in progress", I must warn that these
are just proposal. There is no guarantee they will show up in the final
standard - or, if they do, that they look anything like the current draft of
the proposals.

## [P1227R1](http://open-std.org/JTC1/SC22/WG21/docs/papers/2019/p1227r1.html)
- Signed size function

THere has been a lot of noise over the last few years about the fact that
`size_t` is unsigned and so the corresponding `.size()` member functions on
containers returns an unsigned results. A quick internet search would suggest
that this is single-handedly the root of all evil in the software engineering
field.

But the new `std::span` has a `.size()` function that returns a *signed* value.

Proposal 1227 jumps on this to make the suggestion that a new `ssize()`
function be added to most containers - as well as a new `std::ssize()` free
templated function.

I know I would use it.

Interestingly, Bjarne Stroustrup is (kinda) [against this
proposal](http://open-std.org/JTC1/SC22/WG21/docs/papers/2019/p1428r0.pdf) -
but only because it would *also* change `std::span` to the same unsigned
behavior as other containers. He is definitely in favor of moving to sizes
being signed.

## [P1208R3](http://open-std.org/JTC1/SC22/WG21/docs/papers/2019/p1208r3.pdf) -
Source Code Information Capture

The standard has had the magical "macros" `__LINE__` and `__FILE__` for some
time as well as `_func_`. This Proposal wants to bundle that magic up into a
structure that you can capture and move around.

I can't say I've used `__LINE__` and friends more than a few times, but I could see
where this would ease some tasks around creating good error messages in
libraries for logging, etc.

## [P1411R0](http://open-std.org/JTC1/SC22/WG21/docs/papers/2019/p1411r0.pdf) -
Please reconsider <scope> for C++20

What struck me about this is the sheer tenacity it shows. P1411 is actually a
proposal about another
proposal([P0052](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2018/p0052r9.pdf)).
P0052 has been brewing since 2013. As the author puts it ...

    p0052 ... is reaching an age it has to go to elementary school ...
