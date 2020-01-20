---
title: "Attribute Hoisting in Boost Spirit X3"
date: 2019-01-05T05:48:17-05:00
publishDate: 2019-01-07
archives: "2019"
tags: ["C++", "Spirit X3", "Boost"]
---

Spirit tries hard to make dealing with attributes easy, but sometimes,
it just gets in the way.

<!--more-->

When creating complex parsers, X3 [attribute
rules](https://www.boost.org/doc/libs/1_68_0/libs/spirit/doc/x3/html/spirit_x3/quick_reference/compound_attribute_rules.html)
normally do exactly what you want them to do. Repeating elements get
packed into vectors, alternatives become variants, optional elements
result in an optional.

So, the following just works[^1].

```cpp
struct foo { int x, std::string y };
BOOST_FUSION_ADAPT_STRUCT(foo, x, y);

auto p = x3::rule<class p_tag, foo>{"parser"} = x3::int_ >> +x3::alpha ;
```

Note, that the above also makes use of the very handy rule that
`vector<char>` is promoted to a `std::string`.

So, what about this ?

```cpp
// ERROR - doesn't compile
struct intlist { std::vector<int> ints };
BOOST_FUSION_ADAPT_STRUCT(intlist, ints);

auto p = x3::rule<class p_tag, intlist>{"int-list"} = 
    x3::lit('[') >> (x3::int_ % ',') >> ']';
```

It looks like it should work. The delimited list operator forms a
vector. `lit` return nothing. The struct has a `vector<int>` which
should be compatible.

But when you try to compile, you will get a cryptic error message saying
that the `intlist` type doesn't have a member `value_type`. In the code
where I first encountered this, it was 44(!) template instantiation
levels deep when it failed.

So what is going on? To quote from [one of the
tutorials(!)](https://www.boost.org/doc/libs/1_68_0/libs/spirit/doc/x3/html/spirit_x3/tutorials/employee.html):

>But wait, there's one more collapsing rule: If the attribute is followed by
a single element fusion::vector, The element is stripped naked from its container.

(FYI - a fusion::vector is basically a tuple)

Since `lit` doesn't return an attribute, the composite attribute is
`tuple<vector<int>>`. X3 simplifies this to just `vector<int>. In
effect, X3 is trying to directly assign the vector to the struct!

Because of the _other_ collapsing rule (`tuple<a, a>` => `vector<a>`) ,
this can bite at unexpected times.

```cpp
// ERROR - doesn't compile
struct instructions { std::string verb, std::string adverb };
BOOST_FUSION_ADAPT_STRUCT(instructions, verb, adverb);

auto verb = x3::string("walk") | "run" | "swim";
auto adverb = x3::string("quickly") | "slowly";
auto p = x3::rule<class p_tag, instructions>{"p"} = 
    verb >> adverb
```

So, what to do?

There are options. Which one is correct depends on the situation. The
first two options play along with X3. The second two help keep the
struct.

## Option 1 - roll with it.

If there is no need for the containing structure, just return the vector
like X3 wants.

```cpp
auto p = x3::rule<class p_tag, std::vector<int>>{"int-list"} = 
    x3::lit('[') >> (x3::int_ % ',') >> ']';
```

## Option 2 - rebranding

Use your own type

```cpp
struct intlist : std::vector<int> {}

auto p = x3::rule<class p_tag, intlist>{"int-list"} = 
    x3::lit('[') >> (x3::int_ % ',') >> ']';
```

## Option 3 - Capture something you don't want

The collapsing rule does not apply if there is more than one attribute
in the return tuple. So, if we add something to the tuple it won't be
collapsed. For our example, we can capture the opening (or closing)
bracket.

```cpp
struct intlist { char junk, std::vector<int> ints };
BOOST_FUSION_ADAPT_STRUCT(intlist, junk, ints);

auto p = x3::rule<class p_tag, intlist>{"int-list"} = 
    x3::char_('[') >> (x3::int_ % ',') >> ']';
```

`char` returns the character. Now we have a `tuple<char, vector<int>>`
and the collapsing rule doesn't apply.

## Option 4 - Bogus attribute

Another way to add an attribute is by using the `attr()` parser. This
doesn't consume input, but rather exposes its parameter as an attribute.

```cpp
struct intlist { int junk, std::vector<int> ints };
BOOST_FUSION_ADAPT_STRUCT(intlist, junk, ints);

auto p = x3::rule<class p_tag, intlist>{"int-list"} = 
    x3::lit('[') >> attr(1) >> (x3::int_ % ',') >> ']';
```

I ran into this when in the middle of developing a fairly complex
parser. The construct I was trying to (eventually) parse was going to
have several attributes. But I was approaching it slowly. So, I used option
4 to keep the struct and how the vector was to be accessed in other code
stable.

Your mileage may vary.

[^1]: I chose to use the more compact form to declare rules in order to
      keep these snippets small. In "real" code I would probably not do
      this since the actual parser definition gets lost in the
      boilerplate.
