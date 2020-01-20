---
title: "std::string Gotcha"
date: 2019-11-02T10:53:11-04:00
publishDate: 2019-11-18
archives: "2019"
tags: ["c++"]
resources:
    - name: hero
      src: andre-guerra-G4ZjuxOFD8Y-unsplash.jpg
      title: Surpise!
      params:
        credits: "Photo by [Andre Guerra](https://unsplash.com/@andredoesphoto) on [Unsplash](https://unsplash.com/s/photos/surprise)"
---

std::string has some useful features, but be careful.

<!--more-->

## std::string fill constructor
One of the features of `std::string` that I use a fair amount is the fill
constructor. The signature looks like:

```cpp
std::string(size_t count, char c)
```

The created string will have `count` copies of the character `c`. It is nice to
create fillers for aligning output and to initialize strings you will use as
buffers to a known state.

```cpp
std::string one = "This is a very long string";
std::string two = "short string";

std::cout << one << "\n";
std::cout << std::string(two.size()-one.size(), ' ') 
          << two << "\n";
```

( Of course, with the fmt library coming our way in c++20, there will be better
ways to do this. )
(Yes, you could use `std::setw()` and `std::right()` )

So, whats the catch?

## Uniform Initialization

In order to support in-line initialization of aggregates (e.g. like
std::vector), C++ adopted "Uniform Initialization" - a syntax that used braces
to form constructor calls.

```cpp

// This worked in C++03 
int arr[] = { 1, 2, 3, 4 };

// But this did not. It DOES in C++11 and above
std::vector<int> vec - { 1, 2, 3, 4};
```

But, the standard also made it so you can use it in just about any situation

```cpp
class Foo {
    Foo(int a, int b);
}

Foo f{1, 2};
auto g = Foo{1, 2};
```

Using the brace format is to be preferred in most situations, if for no other
reason, it does not allow you to narrow a result. So, given class `Foo` from
above, this is an error:

```cpp
// ERROR - narrowing
Foo h{1L, 2};

// Not an error though narrowing will happen
// -Wnarrowing is your friend
Foo z(1L, 2);
```

Fine, we'll be all modern and change our above alignment code to say:

```cpp
std::cout << std::string{two.size()-one.size(), ' '} 
```

**oops** Compiler fails on that with a narrowing warning - going from unsigned
long int (size_t) to char.

So, what is going on?

## Initializer List

Before Uniform Initialization, there was the initializer list - a type you
could use to overload your class's constructor to take a list of objects.

std::vector, for instance has a constructor that looks like:

```cpp
vector( std::initializer_list<T> init,
        const Allocator& alloc = Allocator() );
```

When the compiler see a line that looks like either of these two, it will roll
the brace enclosed values into a `std::initializer_list` and hand it to the
overloaded constructor.

```cpp
std::vector<int> a = { 1, 2, 3 };

std::vector<int> b{1, 2, 3};
```

But that `b` contains trouble. Vector *also* has a constructor:

```cpp
explicit vector( size_type count );
```

So, what does this initialization do?

```cpp
std::vector<int> c{3}
```

Is that a call to the `initializer_list` overload with one item? Or a call to
`size_type` overload with value 3?

As it turns out, it is a call to the `initializer_list` overload and you will
end up with a vector of length one with the one entry initialized to the value
3.

So, what does that have to do with our compile error on `std::string`?

## Same Stuff Different Type

Turns out that `std::string` *also* has an `initializer_list` constructor. This
allows you to do things like :

```cpp
std::string foo = { 'a', 'b', 'c' };

auto baz = std::string{'a', 'b'};
```

The `baz` line is our clue. When we wrote
```cpp
std::cout << std::string{two.size()-one.size(), ' '} 
```

The compiler decided that we were trying to call the `initializer_list` version
of the constructor (with two values) since `size_t` can be converted to a
`char`. But narrowing is not allowed, so failure.

Because of this odd quirk, we will have to fall back to the classic constructor
syntax for this particular overload.

## Lessons

- The `std::string`` fill constructor is fun.
- Uniform Initialization isn't uniform.
- Be careful out there.

## Resources

- [Uniform Initialization Isn't](https://medium.com/@barryrevzin/uniform-initialization-isnt-82533d3b9c11) - one of many
  discussions.
- [Initialization in C++ is Seriously Bonkers](http://mikelui.io/2019/01/03/seriously-bonkers.html) - wider ranging discussion
  of c++ initialization.
