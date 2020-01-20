---
title: "Resizing Boot Partition for VirtualBox Machine"
date: 2019-02-18T13:53:03-05:00
publishDate: 2019-02-25
archives: "2019"
tags: ["VirtualBox"]
resources:
    - name: hero
      src: boots-1853964_1280.jpg
      title: "boots"
      credit:
        Image by <a href="https://pixabay.com/users/Pexels-2286921/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1853964">Pexels</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1853964">Pixabay</a>
---

The VM I use for development ran out of room on the boot partition. Here is how
I fixed that.
<!--more-->

The VM actually has two drives - an 8G swap drive and then a larger 25G drive
that has the following partitions:

- 1Meg BIOS Boot
- 100Meg BOOT image (ext2)
- 24+G ROOT disk (/, /home, etc) (ext4)

The 100M boot partition turned out to be too small as linux images keep getting
bigger. I was having trouble during upgrades.

The plan then, is to reproduce this same configuration, but with the boot
partition increased to 1G and also increasing the root partition because - well
- why not?

Note that while the exact commands below are specific to the VirtualBox hosted
Arch Linux environment I am upgrading, the ideas will work for anything -
including changing out physical disks.

## Create new disk
Make sure the VM is not running and use the storage settings to create a new
VDI storage and attach it. I chose to make the new disk 100G. Since I already
had the root/boot disk and the swap disk, this new storage wound up in slot 3.
This means it would be seen as `/dev/sdc` inside the VM.

Fire up the VM's console and use fdisk to validate that the new storage shows
up.

    fdisk -l

## Partition the disk

We have our raw storage, now to carve it up into separate filesystems.

```
parted /dev/sdc
mklabel gpt
mkpart 'bios boot' 0.0 1M
set 1 bios_grub on
mkpart 'BOOT images' 1M 1G
mkpart 'ROOT' 1G -1s
```

After these commands, the following devices will be available.

- /dev/sdc1 - the bios boot partition
- /dev/sdc2 - the boot images
- /dev/sdc3 - the root partition.

## Copy Data

Normally, we would now need to use `mkfs` to create the filesystems on the
partitions, but instead will use `dd` to copy the current data.

```
dd ifs=/dev/sda2 ofs=/dev/sdc2 bs=1M
dd ifs=/dev/sda3 ofs=/dev/sdc3 bs=1M
```

Since dd copies the partition *exactly* - including the superblock layout,
etc., the new partitions will wind up looking the same size as the originals.
`resize2fs` will take care of that.

```
resize2fs /dev/sdc2
resize2fs /dev/sdc3
```

## Install grub

To install the bootloader, we must first let grub install its boot code in that
bios boot partition and then update its config to point to the new devices.

The first part is simple

    grub-install /dev/sdc

The second part will require that we actually mount our new filesystems and
chroot.

```
mkdir /mnt/newd
mount /dev/sdc3 /mnt/newd
mount /dev/sdc2 /mnt/newd/boot
chroot /mnt/newd
```

Since `/dev/sdc3` is a copy of the current root, all our tools will be
available.

    grub-mkconfig -o /boot/grub/grub.cfg

## Switch devices

Last steps. Shutdown the VM and head back to the storage settings. Make it so
the new device is attached into slot 0 as the old one was.

Reboot - and voila! Done

## Rescue

If you find yourself in grub rescue mode. Here is the set of commands that will
help get things going again.

```
set root=(hd0,gpt3)
set prefix=(hd0,gpt2)/grub
insmod normal
normal
```

