+++
title= "Spirit X3 Separate Lexer Part II"
date= 2018-10-08
publishDate= 2018-10-08
archives= "2018"
tags= ["C++", "Boost", "Spirit X3"]
+++
[Last time]({{<ref "Spirit-X3-Separate-Lexer-Part-I" >}}), we looked at the lexer and supporting staff. This time, we will look at the primitive parser and final usage.

<!--more-->

The full code is in [GitHub](https://github.com/mhhollomon/blogcode) .

## tok

The `tok` parser is quite simple. Give it the TokenType to look for and it returns true if that is indeed the next token in the stream.

This is the beauty of the separate lexer. The lexer is responsible for the hard work of classifying the characters and splitting them up into logical chucks. Parsing can concentrate on a little higher level of syntactical analysis - how those chunks are organized.

One subtlety in tok's code. We must be sure to consume the token (advance the iterator) if and only if we actually match. Since we are only assuming a ForwardIterator, we can't depend on a decrement operation in order to "unconsume". So we, make sure the increment is only done in the true leg of the match logic.

There is a bit of a flaw in the interface of `tok` . Currently it makes an undocumented assumption that the iterator's value type has a `istype` operation. Once Concepts are standardized (hopefully in C++2020), we would be able to document this. As it is, passing, say, a char iterator would cause a vary hard to debug instantiation error.

In parting, we define two specializations for `operator>>` . These will allow use to simplify the parser expression we write. If we were doing this for real, we would also specialize `operator|` at the very least.

## Main

There should be no surprises here. The grammar is straight-forward. Those helper specializations come in handy letting us string together token type rather than having to explicitly wrap everything into a tok().

```
auto vardef = tok(tokVar) >> tokIdent >> tokSemi ;
```

rather than

```
auto vardef = tok(tokVar) >> tok(tokIdent) >> tok(tokSemi);
```

And we're done.

But we can do a bit better.

## Attributes

The current way `tok()` is specified, it exposes a `string` as its attribute. So, the synthesized attribute for, e.g. `vardef` would be something like `array` . But this is less than desirable. Normally, we would not be concerned about an attribute of say, the `var` keyword. If we DID want to know, we could capture the difference as seaparate rules.

There will certainly be exceptions. For instance, if we had two keywords for a type (say `int`, and `float`), we would definitely care which of these we parsed, but not want to have a separate rule for each.

The solution is to define two different parsers - one which returns an attribute and one which exposes the attribute type `used` . And in v2/parser.hpp, that is what has been done.

#### tok_sym

This is the version that returns the string. It is a renamed copy of the original `tok` .

#### tok_kw

This is the new one that does not return an attribute. There are only two changes from the original.

The attribute is specified as unused:

```
using attribute_type = x3::unused_type;
```

and the assignment to `attr` has been removed.

Now the v2/main can say...

```
auto vardef = tok_kw(tokVar) >> tokIdent >> tok_kw(tokSemi);
```

And now, the synthesized attribute for `vardef` is a simple `string` .

## Other Improvement

We could make other improvements.
We could get keywords to automatically use `tok_kw` by using two different enum classes.
We could provide a third variety that returns the `TokenType` as the attribute (to solve the `int, float` problem.
I'll leave those as exercises for reader.
