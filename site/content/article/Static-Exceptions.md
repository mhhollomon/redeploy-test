+++
title= "Static Exceptions"
date= 2018-09-27
publishDate= 2018-09-27
archives= "2018"
tags= ["C++", "Onyx"]
+++
Dynamic Exceptions have their flaws. Herb Sutter has proposed a replacement known as [Static Exceptions](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2018/p0709r1.pdf) . Lets look at it a bit.

Before we do, we need to look at the C+11 feature std::error_code

## std::error_code and Friends

Anyone who has done any coding in C knows about good old `errno`, the global int that many system functions will set to signal a problem.  This, of course, has many problems, not the least of which is that different platforms could and did use different integer values to represent the same error.

To bring some order to the chaos, `std::error_code` was added along with its friend `std::error_category` .

An error code is actually two numbers - an integer saying which exact error and a "category" or domain for that error. Thus the math related errors and the filesystem errors could have the same integer value, but different domains. A domain or category is nothing but a pointer to a singleton object.

For a bit more, go look at the [cplusplus.com writeup](http://www.cplusplus.com/reference/system_error/error_category/) as well as [a tutorial on creating your own error codes](https://ned14.github.io/outcome/tutorial/error_code/) from the folks behind Outcome.  [And here is another writeup](https://akrzemi1.wordpress.com/2017/07/12/your-own-error-code/) on a use of custom error codes.

For our purposes, std::error_code has four really nice properties:

* It is small - the size two pointers. It could in theory be passed around in cpu registers.
* Creating one cannot possibly throw an exception.
* Copying and/or moving can be done with a memcpy or just two memory read/writes.
* It does not require any RTTI - no dynamic casting is required - only (possibly) a static_cast between integer types.

## Dynamic Exceptions considered harmful

Sutter does a much better job than I can of enumerating the problems with the current exception system. So go read the [paper](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2018/p0709r1.pdf) .

And error returns schemes such as [Expected](https://github.com/viboes/std-make/tree/master/doc/proposal/expected) or [Outcome](https://ned14.github.io/outcome/) aren't much better.

## Static Exceptions

Sutters proposal is to do something like the following.

Introduce a new keyword `throws` .

IF you define a function as :

`T my_function() throws;`

Then behind the scenes the compiler will **act as if** the function was defined.

`variant<T, std::error_code> my_function();`

In the body of the function anything that looks like:

`throw e;`

get translated to a simple

`return e;`

And at the call site

```
try {
    x = my_function();
} catch (e) {
    /* try to recover */
}
```

Will get translated into something like:

```
x = my_function();
if (compiler_magic::is_error(x)) {
     /* try to recover */
}
```

This eliminates the hand-rolled "if checks" that have to be written to use something like Outcome. And it propagates. If you don't handle the call there will still be the check, but it will have a simple return to move the exception outward.

The paper is filled with more details about the interplay between the proposed mechanism and the current exception system, noexcept, and other details the language lawyers need to care about.

## Onyx

I have decided to make this the standard of exception handling in Onyx. There are details to be worked out. In particular in the early stages, I will literally have to rewrite the return types in order to "reduce" Onyx to C++.

But it will be fun to try out.
