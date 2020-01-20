---
title: "Better Identifiers"
date: 2019-10-03T08:05:29-04:00
publishDate: 2019-10-07
archives: "2019"
tags: ["C++"]
resources:
    - name: hero
      src: "jamie-street-NxCUU0lujD8-unsplash.jpg"
      title: "Dog Tag"
      params:
        credits:
            Photo by [Jamie Street](https://unsplash.com/@jamie452?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on
            [Unsplash](https://unsplash.com/s/photos/name-tag?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
---
Using plain old `int`s as identifiers for classes/structs is tried and true, but
we can do better.

<!--more-->

## The problem

While refactoring [yalr](https://github.com/mhhollomon/yalr), I realized I had
the equivalent of the following code:

```cpp
using production_id_t = int;
using state_id_t = int;
using symbol_id_t = int;
```

Which is fine, until you do something like the following:

```cpp
symbol_id_t id = 3;
state_id_t  sid = 4;

/* much code later */
symbol_id_t sym_id = sid;
```

Yes - bad naming. But even careful programmers can make the same mistake.

Lets see if we can't do a bit better.

## First solution

The root of the issue is that `using` creates, not a distinct type, but an
alias for a type. So all three id types are actually the same type. `class`es,
however are distinct types. So lets do it.

```cpp
class state_id_t {
    int id = -1;

    static inline int next_id = -1;

    state_id_t(int i) : id(i) {}

  public:
    static state_id_t get_next_id() { 
        return {++next_id};
    }

    state_id_t(const state_id_t &) = default;
    state_id_t& operator=(const state_id_t &) = default;
};
```

And that is the outline. Not too bad. It would be used as :

```cpp
auto sid = state_id_t::get_next_id();
auto sid2 = sid;
int foo = sid; // FAIL - excellent

// Assume you cut and paste the code to make symbol_id_t
auto sym_id = symbol_id_t::get_next_id()
sid = sym_id; // FAIL (good) they are not the same type with no conversion.
```

That gives us what we want.

Of course, it would be nice to compare two different `state_id_t`s to see if
they are the same. And the ability to write it out to a stream would be nice as
well. These are small, so it would be awesome to move enable. Oh, don't forget
giving them at least a partial order (`operator<`) so that they can be used in
some of the standard containers.

```cpp
class state_id_t {
    int id = -1;

    static inline int next_id = -1;

    state_id_t(int i) : id(i) {}

  public:
    static state_id_t get_next_id() { 
        return {++next_id};
    }
    
    state_id_t(const state_id_t &) = default;
    state_id_t& operator=(const state_id_t &) = default;

    state_id_t(state_id_t &&) = default;
    state_id_t& operator=(state_id_t &&) = default;

    bool operator==(const state_id_t& o) const {
        return id == o.id;
    }
    bool operator<(const state_id_t& o) const {
        return id < o.id;
    }

    friend std::ostream& operator<<(std::ostream& strm, state_id_t id);
};
std::ostream& operator<<(std::ostream& strm, state_id_t sid) {
    strm << sid.id;
    return strm;
}
```

Okay, that is just a yucky amount of code to cut and paste. And I'm sure I have
forgotten some useful bit of functionality. It would be better to be able to do
this once and reuse.

## Try for reuse

So, lets rename the above to `base_id` and go for inheritance:

```cpp
// Not quit right
class base_id {
    /* same as above with the rename */
};

class state_id_t : public base_id {};
```

Except we have a problem. That static method `get_next_id()` returns a base_id
which isn't good at all. It really needs to return an object of our derived
class. But the base class doesn't know about the derived class.

## CRTP to the rescue

Enter the [CRTP - Curiously Recurring Template
Pattern](https://www.fluentcpp.com/2017/05/12/curiously-recurring-template-pattern/).

THe basic idea is to let the base class know about the derived class by making
the derived class name a template parameter of the base class.

```cpp
template<class Derived>
class base_id {
    int id = -1;

    static inline int next_id = -1;

    base_id(int i) : id(i) {}

  public:
    static Derived get_next_id() { 
        return {++next_id};
    }
    
    base_id(const base_id &) = default;
    base_id& operator=(const base_id &) = default;

    base_id(base_id &&) = default;
    base_id& operator=(base_id &&) = default;

    bool operator==(const base_id& o) const {
        return id == o.id;
    }
    bool operator<(const base_id& o) const {
        return id < o.id;
    }

    // needs special handling. we get to it in a moment.
    //friend std::ostream& operator<<(std::ostream& strm, base_id id);
};
// needs special handling. we get to it in a moment.
/*
std::ostream& operator<<(std::ostream& strm, base_id sid) {
    strm << sid.id;
    return strm;
}
*/
```

And it would be used like :

```cpp
// Not quite right
class state_id_t : public base_id<state_id_t> {};
```

The above doesn't quite work, however. The compiler will complain about not
being able to find a `state_id_t(int)` constructor.

## Inheriting constructors

It would be possible to simply cut and paste the constructor definition. But
that would interfere with possible future redesigns. In particular, as it
stands, the derived class does not know (or care) about the actual "type" of
the id. So, that coud be changed from `int` to `long` or `std::string` or
whatever. If we copied the constructor, it would begin to know. The abstraction
would spring a leak.

Instead, we'll use constructor inheritance. By default, methods are inherited,
but not constructors. We can fix this by using a `using`.

```cpp
class state_id_t : public base_id<state_id_t> {
    using base_id<state_id_t>::base_id;
};
```

Note that ALL constructors are pulled into scope. You can't inherit a single
constructor.

The repetition of the base class, etc is rather painful, but not terrible. If
you feel the need, you can always hide it behind a macro.

Now lets see if we can fix the insertion operator.

## Template friends

The trick here is that the operator must now take a `Derived`. That needs to be
reflected in both the `friend` declaration as well as the operator definition.

```cpp
// Attempt 1 - WRONG, but on the correct path

template<class Derived>
class base_id {
    /* yada, yada */
    friend std::ostream &operator<<(std::ostream &strm, const base_id& d);
};

template<class T>
std::ostream &operator<<(std::ostream &strm, const base_id<T>& d) {
    strm << d.id;
    return strm;
}
```

This fails, because our friend declaration is actually a template
speciailzation. But there isn't anything to tell the compiler that our operator
is actually a template. So, we need to predeclare the operator and place the
empty `<>` in the friend signature to announce it is a template specialization.

Note that we can't move the _definition_ of the operator up to the top, because
it references the `base_id` template. Abd we can't change the signature of the
operator to just `Derived` because we are in the base class. So, that is what
the operator will get, the `base_id<Derived>` sub-object.

But since we reference the `base_id<>` template - **that** must also be
pre-declared.

```cpp
template<class Derived>class base_id;

template<class T>
std::ostream &operator<<(std::ostream &strm, const base_id<T> & d);

template<class Derived>
class base_id {
    /* yada, yada */
    friend std::ostream &operator<< <>(std::ostream &strm, const base_id& d);
};

template<class T>
std::ostream &operator<<(std::ostream &strm, const base_id<T>& d) {
    strm << d.id;
    return strm;
}
```

Note, that we could **not** have made the operator template look like:

```cpp
template<class T>
std::ostream &operator<<(std::ostream &strm, const T& d) {
    strm << d.id;
    return strm;
}
```

That would have led to serious issues with the compiler trying to instantiate
the operator for all sorts of things and failing to compile because there was
not a visible `id` member in the type. By using `base_id<T>` in the signature
we can rely on SFINAE to remove this template from the overload set for
everything but those classes we are prepared to handle.

## wrap up

Complete code is be available in the 
[Github
repository](https://github.com/mhhollomon/blogcode/tree/master/identifiers).

THere are several ways that this could be further enhanced.

It would be nice to have the option to have different derived classes to still
pull from the same id pool. This would be helpful if the data is going to be
streamed somewhere else in a format where ids should be unique across the
stream, not just per entity class. This could be handled using another template
parameter to an "id allocator" that would default to the per class allocator.

Use the [Boost uuid
library](http://www.boost.org/doc/libs/1_65_1/libs/uuid/uuid.html) or
[crossuuid](https://github.com/graeme-hill/crossguid) to generate ids.

Your idea goes here.
