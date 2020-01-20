---
title: "Spirit X3 Error Handling"
date: 2018-12-03
publishDate : 2018-12-17
archives: "2018"
tags: ["C++", "Spirit X3", "Boost"]
resources:
    - name: hero
      src: boots-1853964_1280.jpg
      title: "Boots"
      params:
        credits: 
            Image by <a href="https://pixabay.com/users/Pexels-2286921/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1853964">Pexels</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1853964">Pixabay</a>
---

Once your parser grammar grows beyond a few rules/parsers, handling errors will
become a priority. Being able to give feedback about where things went wrong,
what exactly went wrong, and possible fixes are all things you would like to
provide. It might also be nice to see if you could recover the parsing process
from the point of failure and continue parsing to maybe find other problems.

<!--more-->

All code can be found on [github](https://github.com/mhhollomon/blogcode).

### V1 - The problem.

If you have read the other posts I've written on using Boost::Spirit, you will be familiar with this grammar:

```c++
auto const kw_var = mkkw("var");
auto const kw_func = mkkw("func");

auto const ualnum = alnum | char_('_');
auto const reserved = lexeme[symtab >> !ualnum];
auto const ident = lexeme[ *char_('_') >> alpha >> *ualnum ] - reserved;

auto const vardec = kw_var >> ident >> ';' ;
auto const funcdec = kw_func >> ident >> ';' ;

auto const stmt = vardec | funcdec ;

auto const program = +stmt;
```

Statements are either `var foo;` or `func foo;`  repeated until you get bored. The two keywords are reserved.

And v1 works fine.

```plaintext
> ./v1 "var foo ; func bar; func baz;"
parsing : var foo ; func bar; func baz;
Good input
> ./v1 "var foo; func bar func baz"
parsing : var foo; func bar func baz
Failed: didn't parse everything
stopped 17 characters from the end ( 'f' )
```

But look at the error case for a minute.

First, the main parser returned success, even though it didn't parse everything - which is fine. But look at the location it returned - the "f" in "func bar". That would be correct as well. That is as far as it could correctly parse. But it is only minimally helpful in deciding what is wrong.

The problem here is actually a feature - backtracking. If a parser cannot parse something, it will shrug it off and return so something else could try.

We use this to our advantage in the line:

```c++
auto const stmt = vardec | funcdec ;
```

If `vardec` failed to see the keyword `var` and threw up its hands in disgust, this would never work. Instead, it returns and allows `funcdec` to take a crack at it.

This allows parsers to be composable with very little fuss. You don't have to worry about common prefixes causing issues.

To be sure, backtracking can eat up time, so you do want to think about your grammar; but for small grammars or prototypes, it can be a blessing.

### V2 - setting expectations.

But we can do a little better, and Spirit can help.

Because of the way the grammar is defined, we know that once we see the `var` keyword, we better see an ident. Nothing else will do. And really, there is no point in backtracking, nothing else will match the `var`. And same thing for the "ident". There had better be a semi-colon - nothing else will do. So let's tell Spirit that by using the expectation operator `>` rather than the sequence operator `>>`.

```c++
auto const vardec = kw_var > ident > ';' ;
auto const funcdec = kw_func > ident > ';' ;
```

So we make those changes, run with the error string and...

```plaintext
$ ./v2 "var foo; func bar func baz"
parsing : var foo; func bar func baz
terminate called after throwing an instance of 'boost::exception_detail::clone_impl<boost::exception_detail::error_info_injector<boost::spirit::x3::expectation_failure<__gnu_cxx::__normal_iterator<char const*, std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> > > > > >'
  what():  boost::spirit::x3::expectation_failure
```

It throws an exception. But note that `what()` line at the end. That is Spirit telling us we didn't meet an expectation. So, actually it worked. Since "Success" means we parsed and "Fail" means backtrack and try something else, the only way the expectation operator has to tell us there is a problem is to throw an exception.

Now, we could use try/catch to grab the exception. And a little sleuthing would show that the object also has a `where()` that returns an iterator. That iterator points to the character that failed to meet our expectation. It also has a `which()` that shows .. err.. which parser failed (in the example it would be ';'). Sounds perfect.

But we're going to do something even better.

### V3 - Tag and release

When you create a rule (rather than a bare parser), one of the pieces of info you give to the template is a unique "tag type". The tag type is used by the meta-programming magic in Spirit as a kind of identifier for the rule. Meta-programming can't easily get at the names of things, but can get at types.

```c++
struct my_rule_tag {};
x3::rule<my_rule_tag>const my_rule = "my_rule"
auto const my_rule_def = .....
BOOST_SPIRIT_DEFINE(my_rule)
```

But the tag type can do other things.

The interesting one for our purposes is error handling. If the tag type has a public template member function named `on_error()`, Spirit will call that instead of throwing the error. So, lets turn `stmt` into a rule and see what the handler looks like.

First, the lines for `stmt` itself.

```c++
x3::rule<stmt_tag> const stmt = "stmt";
auto const stmt_def = vardec | funcdec ;
auto const program = +stmt;
BOOST_SPIRIT_DEFINE(stmt);
```

Now the definition of stmt_tag:

```c++
struct stmt_tag {

template <typename Iterator, typename Exception, typename Context>
   x3::error_handler_result on_error(
      Iterator& first, Iterator const& last, Exception const& x,
      Context const& context)
   {
     /* error code goes here */
     return x3::error_handler_result::fail;
   }
};
```

There is a lot of information available to you. The `Exception`object has information `where`, `what` went wrong as well as what was expected (`which`). 


The `last` iterator is the end of input iterator that was passed into the parser to start (ie the call to `phrase_parse` in `main`).

The `first` iterator is the where the rule parse started. And this is why you want the error handling in as low-level a construct as possible. After all, if you put the error handling at the rule for the entire function definition, then `first` will point to the start of the definition, even if the failure was in line 50 of the function body. For our sample error string, it will point to the "f" in the second "func" keyword.

The [V3 code](https://github.com/mhhollomon/blogcode/blob/master/errors/v3.cpp) makes use of this to try to print an error message that points to the place where parsing fails.

```plaintext
$ ./v3 "var foo; func bar func baz"
parsing : var foo; func bar func baz
ERROR! : boost::spirit::x3::expectation_failure
Error! Expecting: ';' here:
 func bar func baz
----------^-------
Failed: didn't parse everything
stopped 17 characters from the end ( 'f' )
```

Really that error formatting should be broken out so it can be reused in a lot of our rules[^1].

Also, it would be really cool if we could continue to parse and possibly catch more errors.

### V4 - Acceptance

Lets first move the the print code out to a template functor [error_reporter](https://github.com/mhhollomon/blogcode/blob/master/errors/v4.cpp). This will clean things up immensely. The new `on_error` looks like:

```c++
  error_reporter<Iterator, Exception, Context> er;

  er(first, last, x ,context);

  return x3::error_handler_result::fail;
```

So far, we have returned `fail` at the end to tell the parser to give up. But we have other choices.

Value  |action
-----  |------
fail   |Give up.
accept |Act like the parse works and keep going.
rethrow|Rethrow the exception - a later on_error may try to handle.
retry  |Try parsing the same rule again.

It should be obvious that if you return `retry` you better have made a change or you are just going to end up in this `error_handler` again. Accept is the same way.

For our code, since there is no way to make the current characters acceptable, we will "skip" them. This can be done by moving the iterator forward to the position pointed to by `x.where()` and returning `accept`[^2].

```C++
first = x.where();
return x3::error_handler_result::accept;
```

Now, when we running with our faulty code ...

```plaintext
$ ../build/errors/v4 "var foo; func bar func baz"
parsing : var foo; func bar func baz
ERROR! : boost::spirit::x3::expectation_failure
Error! Expecting: ';' here:
 func bar func baz
----------^-------
ERROR! : boost::spirit::x3::expectation_failure
Error! Expecting: ';' here:
func baz
--------^
Good input
```

Well, it found both errors -- but why the "Good input" then?

Our code is handling the exception and is telling Spirit to "accept" the parse. So, it has no way now to communicate that a failure happened.
 We could, of course, keep track with a global variable, but no. What would be nice is if Spirit had a way to specify a callback when an error happened. Then the client code using the parser could do whatever it felt appropriate.

### V5 - Call Me Maybe

This is where we finally get to look at the `Context`.

The Context can be thought of as a simple map between identifiers and objects. The grammar builder can use it anyway they choose to facilitate holding state and communicating either between parts of the grammar or with the grammar and the client.

Of, course, this is metaprogramming, so it isn't that simple. The identifiers are actually types. But the idea remains the same.

Let's use the Context to store a small object that will do nothing more than track the number of times it is called. `main` can then check this at the end to see if any errors occured. First, the class. we make it a functor for ease of use. For future expandability, we will make it take the iterators.

```cpp
// tag for the counter
struct error_counter_tag;

// counter functor
template <typename Iterator>
struct error_counter {
    int error_count = 0;
    void operator()(Iterator const& first, Iterator const& last) {
        error_count += 1;
    }
};
```

Now we can create an instance of our functor and place it in the Context. That is accomplished via the helper `with`. In essence we will wrap our parser and change its type by adding this object.

```cpp
using boost::spirit::x3::with;
auto errcnt   = error_counter<decltype(iter)>();

auto const parser = with<error_counter_tag>(std::ref(errcnt))
   [ program ];

bool r = x3::phrase_parse(iter, end_iter, parser, x3::ascii::space);
```

We also changed the call to `phrase_parse` to reference the new wrapped parser `parser` rather than `program`.

Now back up a bit and lets get it so `on_error` will actually call the functor. To do so, it must first retreive it from the context by using a templated get. Then, it can call `operator()`

```cpp
auto& counter = x3::get<error_counter_tag>(context).get();

counter(first, last);
```

Now back to main where we need to actually query the error count.

```cpp
if (errcnt.error_count > 0) {
   std::cout << "Failed:" << errcnt.error_count << " errors occured\n";
   return 1;
} else if (iter != end_iter) {
    ...
```

Now, when we run with the faulty string ...

```plaintext
$ ../build/errors/v5 "var foo; func bar func baz"
parsing : var foo; func bar func baz
ERROR! : boost::spirit::x3::expectation_failure
Error! Expecting: ';' here:
 func bar func baz
----------^-------
ERROR! : boost::spirit::x3::expectation_failure
Error! Expecting: ';' here:
func baz
--------^
Failed:2 errors occured
```

This just scratches the surface, but should give you the tools to handle errors in Spirit::X3 parsers.


#### Footnotes
[^1]: Spirit has a nice helper class x3::error_handler that does a much better job at printing these message, _and_ can do so to any stream.
[^2]: The [Spirit error handling tutorial](https://www.boost.org/doc/libs/1_68_0/libs/spirit/doc/x3/html/spirit_x3/tutorials/error_handling.html) seems to imply that the system will move the iterator for you as a response to the `accept`. It does not.
