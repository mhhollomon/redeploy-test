+++
title= "Integrate VirtualBox and PuTTY"
date= 2018-12-10
publishDate= 2018-12-10
archives= "2018"
tags= ['VirtualBox', 'Putty', 'PowerShell']
description = "A simple Powershell script to automate starting and logging into a headless VBox VM with PuTTY"
+++

This is a simple Powershell script to automate starting and logging into a headless VBox VM using PuTTY.

My main development environment is a [VirtualBox](https://www.virtualbox.org/) VM running [Arch Linux](https://www.archlinux.org/) on top of a Windows 10 host. 
While I could work directly on the console, I like to have multiple windows up - one that has vim running and one that I use for things like running `hugo server`.

So, I start the VM headless and connect to it with one or more PuTTY sessions. Yes - I could use XWin remotely, but that is just something else to start and I don't really want the graphics. Yes, I could use `screen`. But that seems a little _too_ 80s - even for me. So, multiple PuTTY seesions into a headless VM is a compromise that works for me. Your mileage may vary.

So, with that settled, the routine becomes clear - open the VBox GUI, start the VM, wait, Start PuTTY. Bleeh. There has to be a better way. So, connect-vm was born.

Oracle provides a CLI - [VBoxManage](https://www.virtualbox.org/manual/ch08.html). With VBoxMange you create, remove, reconfigure, stop, start, etc VMs.

Simple then; two lines -

~~~powershell
VBoxManage startvm $vmid --type headless
PuTTY user@ip
~~~

Except this fails. `VBoxManage` returns when the VM starts running **not** when the guest OS is finished booting. PuTTY will timeout before the OS is ready to talk.

So how can we tell if it is finished booting? One posibility is to do a `ping`. This isn't technically correct, but it will do the trick.

But that brings us to the question of that IP address. Is there a way to discover that - rather than hardcoding it?

There is, but it comes with some caveats. You must have the [guest utilities](https://www.virtualbox.org/manual/ch04.html) installed on the guest OS and it will only work if you are using a [Bridged Network](https://www.virtualbox.org/manual/ch06.html#network_bridged) on the VM.

~~~powershell
> VBoxManage guestproperty get $vmid "/VirtualBox/GuestInfo/Net/0/V4/IP"
Value: 10.0.0.90
~~~

This reaches into the VM and requests ifnormation for the guest modules that are running. SO, if the Guest OS is not ready, you will get the following string instead.

~~~plaintext
No value set!
~~~

So, this is that mythical stone that kills two birds - we can tell if the OS is up and runing and we can get the IP address.

Since the rest is the normal argument handling, etc, here is the script.

{{<gist mhhollomon cdac394fc20664090af8ab7132c102a4 >}}
