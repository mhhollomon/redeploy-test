+++
title= "Identifier Parsing - Redux"
date= 2018-09-20
publishDate= 2018-09-20
archives= "2018"
tags= ["C++", "Boost", "Spirit X3"]
+++
The ink hadn't dried[^1] on my [Identifier Parsing]({{<ref "identifier-parsing-in-boost-spirit-x3">}}) post when I realized that there was indeed a better way to handle multiple keywords.

In that post I stated that a `symbols<T>` parser would not help because it suffered the same problem as `lit()`. Which is true.

What I missed was that, of course, you could use the same trick with symbols as you did with `lit()` to make it work.

Like this:

```
symbols<int>symtab;
symtabs.add("var")("func");

auto const reserved = lexeme[symtab >> !alnum];
auto const ident = lexeme[ +alnum - reserved ];
```

That does what we need.

And, we can fix up our lambda to automatically register new keywords.

```
auto mkkw = [](std::string kw) {
    symtab.add(kw);
    return lexeme[x3::lit(kw) >> !alnum];
};
```

Now, we can happily make up keywords and keep the rest of the parser in sync.

I will place a V4 in the [Github repository](https://github.com/mhhollomon/blogcode/tree/master/parse_ident).


[^1]: Yea, I know. Work with me.
