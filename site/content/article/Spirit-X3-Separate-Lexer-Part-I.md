+++
title= "Spirit X3 Separate Lexer - Part I"
date= 2018-09-29
publishDate= 2018-09-29
archives= "2018"
tags= ["C++", "Spirit X3", "Boost"]
+++
Back in [this post]({{<ref "identifier-parsing-in-boost-spirit-x3">}}), I said about Spirit ..

> ...it would be very feasible to write a lexical analyzer that makes a token object stream available via a ForwardIterator and write your grammar rules based on that.
But is it ? really?

The short answer is - Yes it is feasible, but probably not a good idea.

The long answer is the journey we'll take on the next two posts.

## Overall Design

The first part will be a stand-alone lexer (named - of course - Lexer), that will take a pair of iterators to a character stream and turn it into a stream of Tokens. The token stream will be available through an iterator interface. We'll look at in more detail in a moment.

The Spirit framework can be thought of as having 4 categories of classes/objects:

* rules
* combinators ("|", ">>", etc)
* directives (lexeme and friends)
* primitive parsers (char_, etc)

Only the primitive parsers truly care about the type you get when dereferencing the iterators. Unfortunately, they really care (and rightly so). So, that means we will need to write replacements for them. Fortunately, we do **not** have to replace any of the rule or combinator infrastructure or this would be undoable - even on a dare.

To recap - we will be writing the following classes:

* Lexer - the tokenizer
* Token - the class that represents the lexed tokens.
* tok - a primitive Token parser.

We will look at Token and Lexer in this post and tok in the next.

All code can be found in the [GitHub repository](https://github.com/mhhollomon/blogcode/lexer)

## Token Class

Looking at lexer.hpp, the first thing we see is the `enum TokenType` . No surprises here except possibly the fact that we need a special tokEOF to signal the end of the end input. This will also act as the marker for the end iterator.

`struct token` is also fairly simple. It will hold the TokenType, iterators to where in the input it was found and the actual lexeme. The lexeme won't be of much use except in the case of 'tokIdent'.

I intentionally made these small so that we could pass tokens around by value most of the time. The embedded iterators are not really necessary for this project, but would be if this were fleshed out more with good parse error reporting.

The most important things are the `istype` member function and `mkend()`. 
`istype()` will be what the parser uses to decide if there is a match. 'mkend()` is a static helper to generate an EOF token.

## Lexer Class

Lets start off in the header file - lexer.hpp.

To keep this simple, I decided to hardcode the fact that we are using std::string::const_iterators as input.

The lexer class itself is simply a shell. It holds on to the input iterators and uses them to create it's own iterators as requested. `begin(), end()` are the only reason the outer class exists.

#### Lexer::iterator

Lets look at this in some detail.

```
using self_type = iterator;
using value_type = token;
using reference = value_type &;
using pointer = value_type *;
using iterator_category = std::forward_iterator_tag;
using difference_type = int;
```

These types are require to allow our iterator to play nice with STL algorithm. The STL templates consult these typedefs to know what types to instantiate for temporary values, etc. We could use these to make the lexer class hyper-general and match any value type for which `operator==` is defined.

But lets not.

```
self_type operator++();
self_type operator++(int junk);
reference operator*();
pointer operator->();
bool operator==(const self_type& rhs) const { return m_curr_tok == rhs.m_curr_tok; };
bool operator!=(const self_type& rhs) const { return !(m_curr_tok == rhs.m_curr_tok); };
```

These are the operators that are needed to make it a ForwardIterator - increment and dereference and equality.

Note, that in general, you will also want to supply a `const_iterator` as well. The only difference would be that `operator*` and `operator->` would return const versions.

Now lets head over to the implementation - lexer.cpp

#### Skip_space

This is a utility that - as the name on the box says - skips spaces. It also helpfully returns an indication if the end of input was reached. In an effort to be somewhat standard, `isspace` is used to decide whether a character needs to be skipped.

#### get_next_token

Here is the heart of the lexer. `get_next_token` returns by value the next token that it can get out of the input or return `tokEOF` if it reaches the end of input or can make a valid token out of the current position.

After skipping spaces, it checks to see if the current character is a "punctuation" token - in this case a semicolon or a parenthesis.

If not, it gathers up the next batch of consecutive alphanumeric characters and checks to see if they are a keyword. If not, it brands it an identifier.

And that's about it for the lexer.

Next time, we'll look at the parsing primitive and put it all together.
