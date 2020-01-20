+++
title = "Onyx Specification"
date  = 2018-10-22
+++
## Built-in Types

### Integral:

int - 32 bit signed integer

byte - 8 bit unsigned integer

bigint - 64 bit signed integer

May need to add a few more but they will all have form intnn (e.g. int16 or int8)

There are no unsigned versions except byte.

implicit conversion can only widen, but cannot narrow. Narrowing conversion can be explicitly requested. Narrowing conversion will throw an exception if the source value is out of range.

### Real:

float - same as C++ float.

double - same as C++ double.

Implicit conversions can only widen. Explicit conversion from double to float will not warn of precision lost, but will throw an exception if the values is not representable (exponent is too large or small).

### Other:

### bool : boolean - values = true, false. Conversion to integral type only via explicit cast.

char: character data. Conversion to integral type only via explicit cast.

## Modules

All files are modules. The first compilable line of a file must be a module declaration.

`module foo;`

If a file does not have a module declaration, it will be as-if the module declaration

`module _main_;`

had been specified. There can only be one such file in a program. Explicit declaration of `_main_` is not allowed.

The symbol `_main_::main()` is the entry point for the program.

Submodules may be declared simply by using nested identifiers.

The language does not support any concept of a "private" module. If a module wishes to use submodules as an implementation detail, then the precompiled versions would simply not be shipped.

As a compiler implementation, the assumption will be that the file name matches the module declaration. Nested modules will reside in an equivalent directory structure. This will be used to search for code or precompiled modules. However, there will also be a precompiled module cache that will be searched.

The exception to the module/filename equivalence will be the _main_ module.

