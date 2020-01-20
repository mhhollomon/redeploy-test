---
title: "Incremental Sieve of Eratosthenes"
date: 2019-01-17T18:40:02-05:00
publishDate: 2019-01-21
archives: "2019"
tags: ['Python', 'C++', 'algorithm']
---

The [Sieve of
Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes) is a well
known algorithm for computing primes, but suffers from space requirements. The
_Incremental Sieve_ solves that problem.

<!--more-->

The Sieve works by walking through each of the numbers in the range. But that
means that you have to store the numbers. Even if you reduce this to a bit map,
the space requirement is **O**(n).

Thinking as a software engineer, it is evident that the core of the Sieve's
implementation would be a nested loop.

```txt
for each prime
    for each multiple
        mark number as composite
    end
end
```

The inner loop depends on the outer loop. That is good for efficiency, but not
for analysis. So lets rewrite as:

```txt
for each prime
    for each number
        if number is a multiple of prime
            mark number as composite
        end
    end
end
```

Now we can see that we could get the same results by inverting the loops.

```txt
for each number
    for each prime
        if number is a multiple of prime
            mark number as composite
        end
    end
end
```
So, now, we don't have to store the numbers. Instead we only have to store the
primes. And since we are storing primes, we should make the test store it. 

```txt
for each number
    for each prime
        if number is a multiple of prime
            go to next number
        end
    end
    add number to list of primes
end
```

The remaining question is - how are we going implement that `if` ? We could
just divide. But division is slow, so lets think of another way.

What if we stored a list of multiples for each prime ? But that quickly becomes
**O**(n^^2) - until we realize that we really only care about multiples that
are "near" our current target number. In, fact we only care about a multiple if
it is equal or larger than our target. And we really only care about the
smallest such multiple. So, in fact, we only need one multiple per prime. And
so, the _Incremental Sieve_.

In pseudo-code it wold look like:

```txt
for each number
    for each prime
        loop while current multiple < number
            get next multiple of the prime
        end
        if number == current multiple
            go to next number
        end
    end
    add number to list of primes
end
```

Or in python:

```py
#!/usr/bin/python3

primes = [ [2, 2] ]

for x in range(3, 100000) :
    isprime = True;
    for pm in primes :
        while pm[1] < x :
            pm[1] += pm[0]
        if pm[1] == x :
            isprime = False;
            break
    if isprime :
        primes.append([x, x]);

print( len(primes))
```

This takes about 21 seconds to run on my ARM Chromebook. Not bad, but maybe we
could do better.

One thing to notice is that all primes (above 2) will be odd. So, there is
really no reason to iterate through the even numbers. But that means we don't
need to store the 2 either, since it will never do us any good.

```py
#!/usr/bin/python3

primes = [ [3, 3] ]

for x in range(5, 100000, 2) :
    isprime = True;
    for pm in primes :
        while pm[1] < x :
            pm[1] += pm[0]
        if pm[1] == x :
            isprime = False;
            break
    if isprime :
        primes.append([x, x]);

print( len(primes))
```

And that runs in about 20 secs. Hmmm. Not as helpful as I had hoped, but still
worth it.

One fact to note about multiplication is that if `a * b = c` then one of those
number must be below (or equal) to the square root of c and the other must be
above (or equal) to the square root. So, if c is not prime, then it must have
at least one of its factors below its square root. Which means, that if we
can't find a factor there, we can stop looking. For our top value of 100,000,
we only need to search primes less than about 317. That is a huge savings.


```py
#!/usr/bin/python3

import math

primes = [ [3, 3] ]

for x in range(5, 100000, 2) :
    limit = int(math.sqrt(x))
    isprime = True;
    for pm in primes :
        if pm[0] > limit :
            break;
        while pm[1] < x :
            pm[1] += pm[0]
        if pm[1] == x :
            isprime = False;
            break
    if isprime :
        primes.append([x, x]);

print( len(primes))
```

And this runs in about 0.6 seconds. Increasing the loop to 1,000,000, the
progam takes about 9 seconds to run.

Just out of curiosity, I also implemented the last version in c++ :

```cpp
#include <list>
#include <iostream>
#include <cmath>


using vtype = long long;

struct pm {
    vtype prime;
    vtype multiple;

    pm(vtype p, vtype m) :prime(p), multiple(m) {}
};

std::list<pm> primes = { {3, 3} };

int main() {
    for (vtype x = 5; x < 1'000'000; x+=2) {
        vtype limit = std::sqrt(x) + 1;
        bool isprime = true;
        for (auto &[p, m] : primes) {
            if (p > limit) break;
            while (m < x) {
                m += p;
            }
            if (m == x) {
                isprime = false;
                break;
            }
        }

        if (isprime) {
            primes.emplace_back(x, x*x);
        }
    }

    std::cout << primes.size() << "\n";
}
```

Compiling and running we get :

```
$ g++ -std=c++17 -O3 incsieve.cpp
$ time ./a.out
78497

real    0m0.093s
user    0m0.084s
sys     0m0.010s
```

Well that is mighty nice. For the record, it took about 30 secs to run with the
loop set to 100,000,000. 

I hope you had fun looking at this variation on an old "favorite".
