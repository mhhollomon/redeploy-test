---
title: "The Onyx Project"
date: 2018-10-14
publishDate: 2018-10-14
archives: "2018"
tags: ["c++", "onyx"]
---
I have decided to design, and build my own computer language. It will be called Onyx.

I agree, that is a pretty big task.

So we will take a bit at time.

#### Design Criteria

I don't really have a whole lot yet. You might think of onyx as C++ EXCEPT - meaning, it acts like C++ EXCEPT these differences. Over time the list will grow and I'll turn it into a full-feature language spec.

Here are the "excepts" so far.

#### Variable/Function declaration

Onyx has a postfix declaration for the type e.g.

```
var foo int;                         // int foo;
var foo * ( * int, *() ) * int;      // int* (*foo)(int*, *());
var baz * [] * int;                  // int *(*baz)[]; I think.
// functions are similar
func doit ( a * int, b MyClass *) YourClass *
```

Yes, there will be keywords introducing variables and function.

I haven't decided what to do about const yet.

```
var foo const int = 3;
// Q: allow abbreviation as : ??
const foo int = 3;
```

#### Classes

Haven't really given this much thought yet. Points up for thought:

* different inheritance types (public/protected/private) or not?
* What are the visibility levels - all three?? I'm leaning towards only two - public and protected (though I will probably relabel them).
* virtual inheritance?

Of course, the biggest questions is - can objects live on the stack (Like C++) or only as references/pointers (like java). I want objects on the stack, but I want to see if we can do something about the awful mess of T vs T* vs T& vs T&&.

My current thinking is that there are no pointers - only T and &T, but that references would be "spelled" "*".  So getting to members through a pointer would use dot notation.

```
var a * MyClass = &anObj; // fine initializing a to reference anObj
var b * MyClass = &otherObj;
a.m1 = b.m1 + 3;  // update a single member
a = b;            // copy - otherObj now has anObj's data.
a = &b;           // update a to reference otherObj (not b)
                  // a would have to have type * * MyClass for that.
```

Move semantics would definitely be baked in from the being.

#### Operator Overloading

Indeed. But I'm thinking of stealing a page from python's playbook  and have special names rather than trying to use the actual lexical symbol. To help, however, they would be names that would otherwise not be valid function identifiers. Maybe something like this..

```
class MyClass {
     func op.assign() {};
     func op.plus() {};
     func op.create() {};  // constructor
     func op.destroy() {}; // destructor
```

The downside of this is that it would be a little weird redefining op.plus to do string concatenation.

#### Templates

I'd like to generalize the if constexpr paradigm to include the whole function/class, so that its entire existence can depend on an "if" of some sort.

```
tif isarraytype(T) {
   func foo(T) int ( /* some stuff */ };
} else {
   func foo(T) int { /* different stuff */ };
}
```

This may not be doable or even make sense. How does it play with normal overloading?

Where are the template parameter lists placed? I'm think of putting them at the class keyword rather than the name.

#### Module System

Modeled after python. But with some compiler support for "Module providers" so that the name of the file would not have to be tied to the file name (e.g. for versioning), but that would be the default.

Modules would be compiled once, of course. only things specifically marked would be exported. Would be nice to have a tool that could generate a reference guide to a module based on its exported symbol table.

#### Phase I implementation

The initial parser/compiler will be built in C++ use Boost.Spirit X3. This phase will be more of a translator that will spit out C++ code to implement the semantics. Module files will be some dense representation of the parse tree.

#### Phase II implementation

This will still utilize Spirit, but will target LLVM IR as the target output.

#### Conclusion

Thanks for making this far. If you have any thoughts on any of the above, I would be happy to hear them.

There is obviously a ton of work to do. And not much spare time. So, this will definitely be a slow leisurely endeavor.

