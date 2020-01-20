---
title: "Building the Latest Version of Hugo"
date: 2018-11-27
summary: |
    This short article shows the process I came up with for building hugo
    on crostini.
publishDate: 2018-11-27
archives: "2018"
tags: ["Hugo", "golang"]
resources:
    - name: hero
      src: "construction-1717893_1280.jpg"
      title: "construction"
      params:
        credits:
            Image by <a href="https://pixabay.com/users/skeeze-272447/">skeeze</a>
            from <a href="https://pixabay.com/">Pixabay</a>
---

My mobile development environment is a chromebook with an arm64 (AArch64)
architecture. It does have Linux (crostini) support. So, that means that I have
a functional Debian Buster distribution.

But the version of hugo that is currently in buster is 0.47 and I need at least
0.49 for the [Hugo theme I'm
developing](https://github.com/mhhollomon/hugo-theme-vellichor). This short
article show the process I finally came up with for getting that newer hugo.

## The Easy Way

Hugo is built using the [go language](https://github.com/golang/go). Debian
contains has a go compiler. So, in fact, the process is as easy as :

~~~bash
$ sudo apt install golang
$ go version
go version go1.10.4 linux/arm64

$ mkdir ~/go
$ cd go
$ go get -v github.com/gohugoio/hugo

$ ~/go/bin/hugo version
Hugo Static Site Generator v0.52-DEV linux/arm64 BuildDate: unknown
~~~

The downside of this is that `go get` always gets the latest on the hugo master
branch - whatever that is. I would prefer to only get sanctioned releases. Lets
do it the hard way.

## The Hard Way

The trick will be to use the `-b` option to `git clone` get a specific release tag.

Current hugo versions support something called "go modules", which
unfortunately is only supported by go version 1.11 and above. Regretfully that
means we'll need to first update the go compiler.

### Build Go

~~~bash
cd ~
mkdir ~/go
git clone --depth=1 -b go1.11.2 https://go.googlesource.com/go golang
cd golang/src
./make.bash
~~~

The new executable will be in the directory `golang/go/bin`. Be sure to add that
to the front of your path.

You could run `./all.bash` instead to get it to run the test suite. But you
might get a false failure[^1].

Now, lets build hugo.

### Build Hugo

```bash
git clone --depth=1 -b v0.51 https://github.com/gohugoio/hugo.git
cd hugo
go install --tags extended
```

{{<side-note>}}Hugo has changed the way that tags are named. Be sure to verify
the actual tag name from the github project{{</side-note>}}

```txt
$ ~/go/bin/hugo version
Hugo Static Site Generator v0.51/extended linux/arm64 BuildDate: unknown
```

Add `${HOME}/go/bin` to your path and your finished.

## Updating

The easiest way to update either item is to simply remove the source directory
and start over using the new release tag. But you could also do :

~~~bash
git fetch origin tag v0.52
git checkout v0.52
~~~

[^1]: See [this issue](https://github.com/golang/go/issues/27754). The problem has been fixed, but the fix causes the reverse failure depending on the exact version of binutils you have installed.
