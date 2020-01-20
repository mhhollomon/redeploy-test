+++
title= "Identifier Parsing in Boost::Spirit X3 - Custom Parser"
date= 2018-09-22
publishDate= 2018-09-22
archives= "2018"
tags= ["C++", "Boost", "Spirit X3"]
+++
This time around, we will use a custom parser to handle the keywords.

I really hadn't planned on making this a series, but there you go. This will be the last - I think.

## Upgrades

I started from the code from the last post, but did make a minor adjustment. I made underbar ('_') a valid character in an identifier.

```
auto const ualnum = alnum | char_('_');
auto const reserved = lexeme[symtab >> !ualnum];
auto const ident = lexeme[ *char_('_') >> alpha >> *ualnum ] - reserved;
```

## Custom Parser

Parsers in X3 are classes that have a parse template function with a specific signature.
<pre>template&lt;typename Iterator, typename Context, typename RContext, typename Attribute&gt;
    bool parse(Iterator &amp;first, Iterator const&amp; last, Context const&amp; context,
               RContext const&amp; rcontext, Attribute&amp; attr) const
</pre>
`first` and `last` are input iterators that contain the stream of characters (or whatever the iterators are iterating) to match.

`context` and `rcontext` contain various client and system supplied information.

`attr` is the attribute - the value that the parser will pass back on success. In our case, this will just be the keyword itself.

And that really is it. The code itself is straightforward and pretty much mirrors what the "standard" version does - match the given string, then check that next character (if it exists) is not a letter, number, or underbar.

After that, it is just a matter of using the new parser keyword in the `mkkw` lambda.

Now that wasn't bad, was it?

Here is the finished code.

{{< gist mhhollomon 5e4706bc064cd983d5db7d3e13bda20f >}}
