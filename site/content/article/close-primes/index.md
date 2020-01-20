---
title: "Close Primes"
date: 2019-10-03T11:14:52-04:00
publishDate: 2019-10-21
archives: "2019"
tags: ["Logic", "Math"]
resources:
    - name: hero
      src: "bird-3696862_1280.jpg"
      title: "bird twins"
      params:
        credits:
            Image by [Rick Tremblay](https://pixabay.com/users/Meister199-9890276/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3696862)
            from [Pixabay](https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3696862)
---
There is a recent paper that contains progress on proving the conjecture that
there are [infinitely many pairs of twin
primes](https://www.nature.com/news/first-proof-that-infinitely-many-prime-numbers-come-in-pairs-1.12989)

This got me thinking about some other questions.

<!--more-->

If there are infinitely many twins, how about triplets or quadruplets? And
could I actually make a proof for or against those conjectures?

A bit of jargon. Twin primes are those primes that are two integers
apart. 11 and 13 are a twin primes. I will define a run of primes as a set of
primes that are consecutive twins. the numbers 3, 5, 7 are a 3-run of primes.

So the question: How many n-runs are there for some n > 2. Is it inifinite?

We can actually begin to answer this question by looking at how the final
digits behave in primes.

First a warning. When thinking about this, be sure to reason about it as if you
are up at 30 billion. This will help us keep from making mistakes caused by
unusual things that are true about small numbers. We'll mention some of these
later.

So, if we look at the numbers starting at 30 billion and distill them down to
the final digits we have ...

```txt
012345678901234567890123456789
```

Now, lets use the Sieve of Erotosthenes, to get rid of those numbers that can't
be prime. First, the even numbers.

```txt
_1_3_5_7_9_1_3_5_7_9_1_3_5_7_9
```

Now, how about the multiples of 5 (we'll come back to 3 in a minute).

```txt
_1_3___7_9_1_3___7_9_1_3___7_9
```

Well. There is a visible proof that there are no n-runs of primes where
n >= 5. Lets see if we can turn that into a reasonable proof.

```txt
theorem: There are no n-runs of primes where n >= 5.

proof:
-------
Assume such a run exists. There are only 5 "odd" digits - 1,3,5,7,9. A run of
length 5 or greater would need to use all of them, including 5.

But any number (other than 5 itself) that ends in the digit 5 is not a prime - it
is divisible by 5.

The 5-run (1, 3, 5, 7, 9) is possibly an exception for this proof, but 9 is not
prime.

Thus, by contradiction, no such run exists.
```

Note that we had to deal with one of those uncomfortable small number truths. 5
ends in 5 but is prime.

Now, it looks like 3-runs and 4-runs should still be doable. We have that
7,9,1,3 run of digits.

So, lets consider multiples of 3. This is why I picked 30 billion as our start -
it is a multiple of 3. However, any other number will do, you will simply start
the cycle in a different place.

```txt
_1_____7___1_3___7_9___3_____9
```

For 10 billion you start at the caret in the cycle.

```txt
_1_____7___1_3___7_9___3_____9
          ^
```

So, graphically then, where would we put a 3-run or a 4-run?

```txt
theorem: For numbers > 30 there are no n-runs where n > 2.

proof: 
------

The sequence of ending digits of numbers that are NOT multiples of 2,3,5 repeat
in a cycle that spans 30 numbers. There is no sequence of 3 or more digits that
are consecutive.  Thus there cannot be any such runs.

By inspection, the only such run where at least one number is <= 30 is the
4-run (2,3,5,7).
```

Please don't think we've made any progress on the twin prime conjecture. As
numbers get large, we have to look at more and more primes. There is no
guarantee that at some point the interlocking cycles combine to never allow two
"consecutive" digits again..

But hopefully we have had a bit of brain twisting prime fun.
