+++
title= "Spirit X3 File Organization"
date= 2018-12-19T10:55:34-05:00
publishDate= 2018-12-24
archives= "2018"
tags= ["C++", "Spirit X3", "Boost"]
+++

For larger Spirit-based project, organizing the source code well can lead to
more efficient builds and increased maintainability.

Of course, this is true for any project. But the heavily templated nature of
even a fully realized Spirit parser makes this doubly so. Figuring out how to
take advantage of separate compilation while maintaining the ability for each
of the pieces to see the needed type/template information is not trivial.

<!--more-->

Fortunately, the library authors have given us [a starting
place](https://www.boost.org/doc/libs/1_69_0/libs/spirit/doc/x3/html/spirit_x3/tutorials/minimal.html).
Please go read and ponder that and then come back here.

Obviously, I have some problems with the organization proposed in that article.
So lets dive in.

## Iterate this

`employee.hpp` is billed as the "Main parser API". But there is something
missing - the iterator_type. `main` needs to know that type in order to
properly call `parse_phrase`. `employee.cpp` needs it to correctly instantiate
the parser. And the two better agree.  If they don't, at best you get an ugly
compile error. At worst, you get an ugly unhelpful link error.

But, notice that `main` doesn't include `config.hpp`. Instead, it redefines
`iterator_type`. Yikes. So, two places to update if (for instance) you want to
use the `boost::spirit::istream_iterator` as your iterator type.

{{< side-note>}}Be sure to call `phrase_parse` without a namespace. Do _not_
call it like `x3::phrase_parse`. Doing so turns off [Argument Dependent
Lookup](https://abseil.io/tips/49). Evil ensues.
{{< /side-note >}}

## Spaced out

While you are looking at the `phrase_parse` call, look at the 4th argument
`space`. It is not immediately obvious, but that needs to match the template
argument to `phrase_parse_context<>` - helpfully found in `config.hpp`. Again,
if for no other reason than documentation, this needs to be visible to
`main.cpp`.

My suggestion would be to get rid of `config.hpp` and just fold its contents
into `employee.hpp`. The separate file adds no value. Anyone who needs
`employee.hpp` will need to see the contents of `config.hpp`.

But, to my mind that doesn't _really_ help with the skip processor problem.
Let's say you write your own parser that needs to be used with your grammar -
we'll call it `my_skipper`. The grammar you produce is no doubt going to rely
on the fact that `my_skipper` is doing the skipping for correctness. So, in
order for `main.cpp` create the correct call to `phrase_parse`, it needs to see
the definition of `my_skipper` - a type it doesn't otherwise care about.

We'll do a bit better after looking at two more gripe.

## Header-mania

Having the actual grammar definition in a separate file is a great idea.  But
this probably makes more sense to be folded into `employee.cpp`. The only
counter-argument is that it reduces reusability of the grammar since it cannot
be embedded in something larger.

True, but unless the grammar is quite simple, you will also need to pick up all
its assumptions (e.g. skipper, iterator_type, ast, etc).

## Adopting adapters

The AST definitions are in their own file. This makes sense. But is there any
reason that the `BOOST_FUSION_ADAPT_STRUCT` calls are in a different file? I
couldn't come up with any. Looking at the generated code, it doesn't
(obviously) define objects - just template classes.

## A Modest Proposal

See [github](https://github.com/mhhollomon/blogcode/tree/master/file_org) for
the worked out example. This is based on the same grammar example as the
orginal.

Many of the problems listed above is because the grammar must leak quite a few
non-negotiable details to `main.cpp` in order to allow it to properly call
`phrase_parse`. I propose always encapulating that call into the grammar. The
grammar should instead expose a `do_parse` or similar function that actually
does this call. The only thing the client has to provide is the iterators.

The exact details of the function is a matter of taste and project
requirements. For instance, an error reporting stream (or object) can be
provided. But for this example it is as simple as:

~~~c++
std::pair<bool, ast::employee>do_parse(parser::iterator_type &first, parser::iterator_type const &last) {
    ast::employee e;

    bool r = phrase_parse(first, last, parser::employee_type(), x3::ascii::space, e);

    return std::make_pair(r, e);
}
~~~

Lets go over each of files:

### ast.hpp

The definition of the ast structures **and** the needed fusion adaptors.

### employee.hpp

This is - as before - the "API". It contains the include to the ast definitions.
It also contains the **declaration** for the `do_parse` function.  So, this is
the only file that a client needs to include in order to work with this parser.

### employee.cpp

Everything else.

Nice and tidy. The grammar can grow and change - you can even rename the
upper-level grammar symbol - without affecting the code in the client. Want to
use that new awesome `my_skipper`? No-one needs to know. That code might reside
in a separate file if need be, but that is a negotiation between the library
and the parser - the client isn't involved.

