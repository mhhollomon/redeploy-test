---
title: "Working on a Remote VM"
date: 2019-10-12T09:47:38-04:00
publishDate: 2019-11-04
archives: "2019"
tags: ["crostini", "virtualbox", "win10", "ssh"]
resources:
    - name: hero
      src: "world-1264062_1280.jpg"
      title: world
      params:
        credits:
            Image by [TheAndrasBarta](https://pixabay.com/users/TheAndrasBarta-2004841/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1264062)
            from [Pixaby](https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1264062)
---

Logging into a remote VM from a local VM. Getting from here to there isn't all
that hard.

<!--more-->

## The Problem

My main development system is [ArchLinux](https://www.archlinux.org/) running
in a [VirtualBox](https://www.virtualbox.org/) VM on a Windows 10 machine.

My mobile platform is a crostini VM running on a Samsung Chromebook.

For now, if I want to work on my main system while mobile, I do so by using
[Chrome Remote Desktop](https://remotedesktop.google.com/access/).

This works reasonably well, but there are two problems:

1. My desktop screen has a vastly different Aspect Ratio from my chromebook.
   The resulting letterboxing makes the desktop tiny and hard to deal with.

2. If I have to work tethered to my cell phone, bandwith limitation can do
   weird things to the screen and cause usability problems.

My main "IDE" is vim, so I really don't need graphics that much.

## The Goal

Use `ssh` (or something) to get from the crostini VM on my chromebook to the
VirtualBox VM on my desktop. Major extra credit if X can be tunnelled back. But
I'm comfortable with plain old tmux/vim.

## The Journey

I decided to tackle this a small step at a time. I assumed that the two biggest
pieces were going to be making the Win10 box visible on the internet and
forwarding from there to the Virtualbox VM.

### Step 1 - Chromebook to Win10

**Chromebook client**
Google makes an [SSH client for the chrome
OS](https://chrome.google.com/webstore/detail/secure-shell-app/pnhechapfaindjhompbnflcldabbghjo?hl=en).
So that is easy.

**Windows 10 Server**
Windows 10 has an SSH server available, but it is a bit of a task to install. I
finally found a [microsoft
document](https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse) that gave the following two commands.

They need to run in a powershell window with admin privileges.
Note also that this takes a while.

```powershell
Get-WindowsCapability -Online | ? Name -like 'OpenSSH*'
Add-WindowsCapability -Online -Name 'Server name from above'
```

You'll need to reboot afterwards, even though the output of the command says
you don't.

Now, go to the services settings and start the server. And then immediately
stop it. This is needed to get it to create some directories.

Then from an elevated shell - do -

```powershell
cd C:\windows\system32\OpenSSH
ssh-keygen -A
```

The permissions on the key files need to be set. Fortunately, Microsoft has
provided a hack for that:

```powershell
Install-Module -Force OpenSSHUtils
Repair-SshdHostKeyPermission -FilePath C:\ProgramData\ssh\ss_host_ed25519_key
```

Now, back to the services menu and restart the server.

And boom! we're in.

Note, to get the local area IP for your Win 10 box, you can use `ifconfig`.

### Step 2 - crostini to Windows 10

I figured this would be a no brainer. Just fire up ssh in crostini and do it.

Sure enough, No brainer.

### Step 3 - crostini to virtualbox

I also thought this would be easy. I could get to the VM from the Win10 box,
so, this shouldn't be any different.

As it turns out, this was a little painful. The VM had its network set in NAT
mode. Which means the the Win10 was doing the routing and the VM's Ip was
local.

After consulting the VirtualBox manual, I realized I could put the VM's
network in Bridge mode and it would talk pretty much directly to world. And so
it did. As a side benefit, I noticed that the VM was actually visible to my
router/modem as a connected device. This will come in handly in the next step.

I spent about an hour working the kinks out of my various tools to talk to the
VM from the Win10 box to handle this brave new world. Then, from that
experience, it was time to try from crostini to virtualbox.

And Boom! We're in.

And after fixing a silly mistake in my .bashrc and adding the `-X` option to the
ssh command, I had X forwarding working as well. 

Nirvana! At least all on the local network.

The silly .bashrc mistake? I was overwriting the `$DISPLAY` variable. When
ssh/putty are asked to forward X (via the -X option), they set `$DISPLAY` for
you on the remote side so that the X protocol messages get forward. My .bashrc
was trying to be helpful and set DISPLAY based on `$SSH_CONNECTION`. This works
locally on the win10 box (and is actually faster), but it defeats the forwarding.
The clients are directly talking to the X server.

### Step 4 - World Dominance

My ISP provides a router/modem that automatically does NATing. So, all the boxes
on the inside have private IPs that can't be seen from the outside.

After a bit of research, I discovered that my ISP allows me to define port
forwarding rules in the router. So, I could set it up so that, say, port 42 on
the external IP routes to port 42 of the Win10 box or the VirtualBox VM.

Lets go directly for the goal and try to talk to the VB VM.

So, lets pick a port (2121 for this discussion) and do the following.

First define the port forward rule (however you need to do that with your ISP).

Then stop the sshd process on the VM, edit the config file to talk on the new
port, and restart the sshd service.

On my ArchLinux Vm, it looks like the following:

```bash
systemctl stop sshd.service

vim /etc/ssh/sshd_config

# Uncomment the line with:
#   #Port 22
# and set it to our new port
#   Port 2121

systemctl start sshd.service
```

Now, go back to the router and figure out the external IP. It should be listed
as the WAN IP or similar.

```
ssh -C -X user@1.2.3.4 -p 2121
```

and BOOM! We're in.

Now, I've accomplished the goal AND the stretch goal. 

I was going to stop there but decided that I actually wanted to get to the
Win10 box as well. If nothing else, it would be a quick way to restart the VM -
using virtualbox's CLI - when needed.

This turned out be (almost) exactly the same as the configuring the VM.

1. Update the router with yet another port to forward.
2. Go to the service settings widget and stop the service
3. edit C:\ProgramData\ssh\sshd_config to change the port
4. drill a hole in the firewall
   ```powershell
   New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH SSH Server' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort "our-new-port"
   ```
4. Restart the service in the widget.

And done.

Well, not quite. I want to set up publickey encryption and disable password
login, but I won't bore you with that.

### Wrap up.

Of course, one final touch would be to go to any of the multitude of dynamic
DNS services and assign a nice name to that IP.

When I started this, I thought it was going to be journal of things tried and
frustrating setbacks. But it actually turned out to be a reasonably simple 1
day task.

### Resource

Here are some articles I found helpful while doing the research for this.

**windows 10 ssh server**

 - https://winscp.net/eng/docs/guide_windows_openssh_server
 - https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_server_configuration
 - https://winaero.com/blog/enable-openssh-server-windows-10/
 - https://poweruser.blog/enabling-the-hidden-openssh-server-in-windows-10-fall-creators-update-1709-and-why-its-great-51c9d06db8df

**virtualbox docs**

 - https://www.virtualbox.org/manual
