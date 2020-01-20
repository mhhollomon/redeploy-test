+++
title= "Identifier Parsing in Boost::Spirit X3"
date= 2018-09-16
publishDate= 2018-09-16
archives= "2018"
tags= ["c++", "boost", "spirit x3"]
+++
In Boost.Spirit X3, parsing identifiers is a bit tricky.

If you are used to the distinction between lexical analysis and syntactical analysis (as I am), Spirit can take some getting used. Lexical analysis is done in the same grammar as the syntactical analysis. So the ubiquitous IDENT token type is now a grammar rule.

To be sure, it doesn't have to be this way. Spirit parsers work on iterator pairs, so it would be very feasible to write a lexical analyzer that makes a token object stream available via a ForwardIterator and write your grammar rules based on that.

That has some benefits. It definitely would keep the grammar a bit cleaner since you don't have to write rules around lexical issues. And you don't have to care about the skip parser (the user-supplied grammar for recognizing spaces, etc that you don't want to be considered as important input).

But the separation also has a cost. You will frequently have to create a feedback loop where the parser must give guidance to the lexer in order to reduce ambiguity in the grammar. Which means that the two are going have to share a good bit of state. So, if they are going to be all in each other's business anyway, you might as well use Spirit to write both.

But using Spirit for both ALSO has a bit of cost. Things can get tricky. Lets take a look.

### A First Simple Attempt

Below is the code for a a very simple grammar - input is the keyword "var" followed by an identifier - that duo can be repeated as many time as you want. Everything is space separated.

Note that the code is also available [via Github](https://github.com/mhhollomon/blogcode/tree/master/parse_ident)

{{< gist mhhollomon "475312dbdce7d574cbb3b6983b2a4b60" >}}

Lets go to the bottom for a minute and look at main(). This won't change so we'll get it out of the way. Most of this is self explanatory, but I want to mention two things.

The first is the if/else if/else. In general, this is how you will need to check the outcome of your parse. The return value will be true unless special error handling says otherwise. Possibly we will delve into that in a future post. So, the main way to know if you got what you wanted is to see if all the input was consumed.

Now let's look at the call to the Spirit parsing engine.

```
bool r = x3::phrase_parse(iter, end_iter, program, x3::ascii::space);
```

The two iterators say what to parse, `program` is the parser to use, and `space` is the skip parser.

The skip parser is a special parser that Spirit calls between calls to other parsers. So, if you have a line

```
A >> B >> *C
```

then, Spirit will act as if you has specified

```
skip >> A >> skip >> B >> *(skip >> C)
```

This will be important in a few paragraphs.

So, now the actual parser:

```
auto const kw_var = x3::lit("var");
auto const ident = lexeme[ alpha >> *alnum ];
auto const stmt = kw_var >> ident;
auto const program = +stmt;
```

A "program" is one or statements each of which is the the keyword "var" followed by an identifier which made up of one or more alphanumeric characters.

Le me talk about the "lexeme" parser for a minute. Remember that Spirit inserts a call to the skip parser between invocations of other parsers? If we had written `ident` as simply

```cpp
auto const ident = alpha >> *alnum;
```

that would have been transformed into

```
auto const ident = alpha >> *( skip >> alnum );
```

The effect would be that the `ident` parser would happily consume all the input (assuming no punctuation characters) since "space" (our skip parser) soaks up all the spaces, tabs, etc.

**lexeme** turns off skip processing for the parser it encloses. So, with lexeme, ident will stop at the first non-alphanumeric character - including spaces. lexeme is a way to say that spaces (or what ever the skip parser normally consumes) is important.

So, does our parser work? It does! It even fails as expected.

```
$ ./parse_ident_v1 "var foo var bar"
parsing : var foo var bar
Good input
$ ./parse_ident_v1 "var foo var"
parsing : var foo var
Failed: didn't parse everything
stopped 3 characters from the end ( 'v' )
```

Or does it?

```
$ ./parse_ident_v1 "varfoo varbar"
parsing : varfoo varbar
Good input
```

### A Second Attempt

The problem is that the string parser "lit" is, well, too literal. We asked it to check if the three characters 'v', 'a', 'r' were in the input stream - and they were. What we really wanted is that those characters were in the stream AND they were not followed by anything that we allow in an identifier.

```
auto const kw_var = lexeme[x3::lit("var") >> !alnum]
```

Note that we now have to use `lexeme` otherwise we would skip spaces before checking to see if there was a alphanumeric character.

```
$ ./parse_ident_v2 "varfoo varbar"
parsing : varfoo varbar
Failed: didn't parse everything
stopped 13 characters from the end ( 'v' )
```

Much better. Note that it stopped at the "v" in "varfoo".

But we still have a problem.

```
$ ./a.out "var var"
parsing : var var
Good input
```

Hmmm..

### A Third Attempt

If the language you are parsing doesn't reserve keywords, then we're done. But most languages have at least a few reserved words that cannot be used as general identifiers.

The first fix actually helps us here as well.  The fix is as easy as :

```
auto const ident = lexeme[ (alpha >> *alnum) - kw_var]
```

Note that the "except" operator ( "-" my term) may not work the way you think. What does NOT happen is that the first parser does its thing and then the "except" parser checks to see if it matches and fails if it does.

The order of operations is reversed from what might be implied by the expression. The "except" parser runs first. If it matches, then the whole expression fails. If it does NOT match, then the primary parser ( +alnum in this case) runs.

Because of this, something like:

    auto const ident = lexeme[ +alnum - lit("var") ]

would **fail** to match the string "variable" for the same reason that "varfoo" **succeeded** in our first attempt.

With that in mind let's do one more thing - let's cater to the case of multiple keywords.

### Multiple Keywords

It would be tempting - after glancing at the Spirit X3 docs - to try to use x3::symbols for this. It would indeed be nice if it worked:

```cpp
x3:symbols symtab.add("var")("func");
auto const kw_var = lexeme[ lit("var") >> !alnum];
auto const kw_func = lexeme[lit("func") >> !alnum];
auto const ident = lexeme[(alpha >> *alnum) - symtab ]
 ```
Unfortunately, this suffers from "lit"-erally the same problem. symtab is (for parsing purposes) equivalent to:

    symtab = lit("var") | lit("func")

So the string "var variable" would - again - be rejected.

We will need to define a new parser "reserved" that wraps up all the reserved words.

```cpp
auto const kw_var = lexeme[ lit("var") >> !alnum];
auto const kw_func = lexeme[lit("func") >> !alnum];
auto const reserved = kw_var | kw_func;
auto const ident = lexeme[(alpha >> *alnum) - reserved ]
 ```
And presto!

So, here is the final code. I have also made a little helper lambda to define keywords. I tried to figure out a way to have it also add the new keyword to the reserved parser, but couldn't come up with anything. I'm happy to listen to any suggestions.

{{< gist mhhollomon "a56125347219a15cdd2e96eff7f07feb" >}}

### Final Thoughts

Doing lexical analysis in Spirit is not much different for actually writing one freehand. The same thought processes are involved. Just be aware of the skip processor and you'll do fine.

