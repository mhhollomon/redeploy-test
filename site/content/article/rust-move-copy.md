+++
title= "Rust Move vs Copy"
date= 2018-12-01
publishDate = 2018-12-03
archives= "2018"
description= "For Move vs Copy, Rust has made mostly opposite decisions from C++"
tags= ["Rust", "C++", "onyx"]
+++
I've been looking at the [Rust Ownership model](https://doc.rust-lang.org/book/2018-edition/ch04-01-what-is-ownership.html) .

The skinny is that Rust has made mostly opposite decisions from C++.

## Copy vs Move

An assignment in Rust is by default, a move. The original variable is declared as invalid and using it will net you a hard error at compile time.

The example used in the docs is:

```rust
let s1 = String::from("hello");
let s2 = s1;
println!("{}, world!", s1);
```

That last line will not compile because s1 is no longer valid.

Another place this can show up is in calling functions. By default, initializing the arguments for a function is a move, so ownership is transferred to the function. The only way to transfer it back via returning the value back. Since, in Rust, you can return multiple values back without a lot of ceremony, this isn't horrible. And there are references, which allows the function to "borrow" ownership - kinda.

First, lets look at another code example (again, straight from the docs).

```rust
let x = 5;
let y = x;
println!("x = {}, y = {}", x, y);
```

This works! Why? because the i32 type has been marked with a trait called Copy. `String` does not have this trait.

The stated reason for this is that it prevents dangling pointers and double frees. `String` is a control block with a pointer to heap store for the actual contents. Obviously, duplicating the control block (As the assignment would in C++ if the default copy-assign was present), will indeed lead to double frees.

Look at the following:

```rust
struct Foo { a: i32, b: i32 };
let x = Foo{ a: 1, b: 2};
let y = x
println!("{}", x.a)
```

This will also fail to compile - even though the compiler could quite easily figure out that a memcpy would do a perfectly adequate job.

You can tell the compiler to allow copy by setting the Copy trait.

```rust
#[derive(Copy, Clone)]
struct Foo { a:i32, b: i32 };
```

In, this case, the compiler will generate the memcpy for you.

There is a caveat. You cannot derive Copy for a struct if Drop (i.e. destructor) is required. This is because there is no way to define what Copy does. Either memcpy works or you can't do it. In C++ terms, your copy-assign operator is either `=default` or `=delete` .

Having move as the default definitely feels wrong. I'm trying to decide if that is simply because I'm used to the other way. One telling fact is that they went out of their way to make sure the primitives were Copy. Value semantics is very important.

I wonder if there might not be some value (har!) in making this explicit. Maybe things that don't have identity (like the number 5 or the complex number 3i-6) should be declared with a different key word than "class". Whereas things that have identity (e.g. Account or File) might stay with "class". The values would have copy semantics; Classes would have move semantics.

An interesting question would be - do containers have identity? I would argue that they do.

In some sense this would just be the idea of an "immutable" object - or rather a class that only creates immutable objects.

One thing is for sure. The C++ notion that you have to comb through the definition of the class in order to infer if it uses value semantics is also wrong. Sure, an experienced programmer can tell in a couple of seconds (maybe), but should it take even that long?
