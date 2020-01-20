---
layout: post
title:  "Chrome OS Linux Container (crostini) tips"
date: "2018-11-18"
publishDate: "2018-11-18"
archives: "2018"
tags: ["crostini", "Chrome OS", "ChromeBook", "tip"]
---
The new Linux Containers available on some ChromeBooks are manna from heaven if
you are a developer. Having a full blown Debian based distribution just a click
away makes supported ChromeBooks very usable development platforms. And getting
such a device can be cheap.

Here is a set of tips to help make things a little nicer.

<!--more-->


## Error trying to see "Linux Files" (added 2019-11-11)

If you go to Files > My Files > Linux Files, it is supposed to show you the
files in your home directory in the linux container. However, you might also see 
something like

```txt
Error mounting crostini container: 15
```

The error number may change. 

Here are some things to try to fix it.

### flags

Go to `chrome://flags` and press "Reset all to default" in the upper right hand
corner and restart.

### groupadd

In the containers shell, type

```bash
sudo groupadd chromeos-access
```

Restart linux.
## Updating the Debian version (added 2019-10-08)

Currently, the bundled distribution is set to `stretch` which is ... old.
Updating to stable is just like updating debian on any system.

Edit the file `/etc/apt/sources.list` and put in stable where ever you see
stretch.

```txt
sudo vim /etc/apt/sources.list
```

change:
```txt
deb https://deb.debian.org/debian stretch main
deb https://deb.debian.org/debian-security stretch/updates main
```
to:
```txt
deb https://deb.debian.org/debian stable main
deb https://deb.debian.org/debian-security stable/updates main
```

Then it is the normal

```txt
sudo apt-get update
sudo apt-get dist-upgrade
sudo apt clean
```


## Viewing Local Servers

Many systems these days come with a bundled local webserver to allow you test
your changes without having to stage to a external host (think node.js, hugo,
jekyll, etc). By default, these always want to listen on localhost (127.0.0.1).
But the Linux container is a full-fledge VM and so localhost is, well, local.
This means that you can't use the "main" browser and point it to the localhost
and have anything useful happen.

### Solution 1 - Install browser in the VM

One solution is to install the browser of your choice into the VM and use that.
But you have a perfectly good browser already installed, so why take up the
space to install another?

### Solution 2 - Switch VM Application to External Interface
In order to use the main browser, you need to coax the local webserver to
listen on the VM's external interface. To get the external interface, you can
use the command `hostname -I` (note the capital I). 

As an example here are the commands to make hugo and jekyll use the external interface.
```txt
hugo server --bind `hostname -I` --baseURL `hostname -I`
jekyll serve --server `hostname -I`
```

To view the server, point the browser to
```txt
http://penguin.linux.test:<port>
```

ChromeOS points that synthetic domain to your Linux VM.

### Solution 3 - Use a Port Forwarder

The Chrome App [Connection
Forwarder](https://chrome.google.com/webstore/detail/connection-forwarder/ahaijnonphgkgnkbklchdhclailflinn)
can set up rules so that when you try to connect to e.g. `localhost:1313` it is
forwarded to `penguin.linux.test:1313`

Note that you _still_ need to make the application talk to the VM's external
interface (solution 2). But now you can point your browser to localhost as you normally
would.

## Configure the terminal

While in the terminal hit `ctrl-shift-P`. This will bring up a browser tab with
settings such a font and colors.

## Force Shutdown the VM

In recent versions, there is actually a menu item to do this. 
Right click on the terminal icon and you should see a "Shut Down Linux (Beta)" item.

If not, you can do it in crosh.

`Ctrl-At-T` to bring up `crosh` shell.

Enter the command: `vmc stop termina`

It will automatically restart when you start Terminal app.

- The default VM name is **termina**
- The default container is **penguin**

## Access the distribution from crosh

```txt
Ctrl-Alt-T                                 # open crosh
vsh termina                                # start the VM and get a command prompt
lxc exec penguin -- /bin/login -f <userid> # start the container
```
