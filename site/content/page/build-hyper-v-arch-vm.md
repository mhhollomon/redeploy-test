---
title: "Build Hyper-V Arch VM"
date: 2019-12-31T16:22:02-05:00
publishDate: 2019-12-31
archives: "2019"
drafts: false
tags: ['arch-linux', 'hyper-v']
---


A raw list of notes about putting together a Hyper-V Arch Linux VM. Take with
a grain of salt.

This adds most of the stuff I use for my development.

More will be added as I still need to figure out sharing files between the host
and guest.

<!--more-->

## VM creation

Run PowerShell as Administrator

```ps1

$SwitchName = 'ExternalSwitch'
$VMName = 'ArchLinux'
$InstallMedia = 'archlinux-2018.05.01-x86_64.iso'
$VMPath = 'C:\Users\Public\Documents\Hyper-V\Virtual Hard Disks\'
$HOSTNAME = (Get-WmiObject -Class Win32_ComputerSystem -Property Name).Name

# create virtual ethernet switch. Find the "real" interface from
# Get-NetAdapter and use it instead of EtherNet in the New-VMSwitch
#
# Not sure this is necessary. There is a "default" switch which should work.
#
Get-NetAdapter
New-VMSwitch -name $SwitchName -NetAdapterName Ethernet -AllowManagementOS $true

#
# per Microsoft
New-VHD -Path "C:\MyVHDs\test.vhdx" -SizeBytes 127GB -Dynamic -BlockSizeBytes 1MB
# mkfs.ext4 -G 4096 /dev/sdX1

# create the machine
New-VM -Name $VMName -MemoryStartupBytes 4GB -Generation 2 \
	-NewVHDPath "$VMPath\$VMName.vhdx" -NewVHDSizeBytes 128GB -Path "$VMPath" -SwitchName $SwitchName

# Set number of processors
Set-VMProcessor $VMName -Count 4

# Disable secure boot
Set-VMFirmware $VMName -EnableSecureBoot Off

# Add DVD drive
Add-VMDvdDrive -VMName $VMName -ControllerNumber 0 -ControllerLocation 1 -Path $HOME\Downloads\$InstallMedia

# Mount the media
$DVDDrive = Get-VMDvdDrive -VMName $VMName

# Set the VM to boot from the DVD Drive
Set-VMFirmware -VMName $VMName -FirstBootDevice $DVDDrive

# Start and get console
Start-VM -Name $VMName
VMConnect $HOSTNAME $VMName
```

## Arch Install

```bash
#
# Check if in UEFI mode
# If the directory exists, then the answer is "yes".
ls /sys/firmware/efi/efivars

parted /dev/sda
mklabel gpt
mkpart 'EFI System' fat32 34 +512M
mkpart 'Linux filesystem' 512M -1s
quit

mkfs.fat -F32 /dev/sda1
mkfs.ext4 -G 4096 /dev/sda2

mount /dev/sda2 /mnt
mkdir /mnt/boot
mount /dev/sda1 /mnt/boot

timedatectl set-ntp true

pacstrap /mnt base base-devel openssh dhcpcd linux inetutils vim wget

genfstab -U /mnt >> /mnt/etc/fstab
```

chroot and configure

```bash
arch-chroot /mnt

#
# Boot loader
#

#
# create boot entry
#
{ 
	grep -v options /usr/share/systemd/bootctl/arch.conf
	echo "options root=PARTUUID=$(blkid -s PARTUUID -o value /dev/sda2) rw"
} > /boot/loader/entries/arch.conf

#
# place entry into menu
#
echo "default arch
timeout 3
editor 0" > /boot/loader/loader.conf

#
# Install the boot loader
#
bootctl install
bootctl update

# Make sure there are no errors
bootctl


# uncomment en_US.UTF-8
$EDITOR /etc/locale.gen

locale-gen

localectl set-locale LANG=en_US.UTF-8

hostnamectl set-hostname archvm

timedatectl set-ntp true

systemctl enable sshd.service
systemctl enable dhcpcd@eth0.service


#
# add non-root user
#
useradd mhh
usermod -a -G wheel mhh

```

## Other Stuff

- edit `/etc/sudoers` to allow wheel to sudo

## others packages

```bash
pacman -S ttf-hack ttf-inconsolata cmake \
	make gcc clang git gvim tmux \
	xorg-xauth jdk-openjdk python \
	xterm xorg-xrdb firefox hugo \
    nodejs-lts-dubnium npm

npm install --global node-watch
npm install --global live-server
# probably others I've missed
```


## Resources
- [Arch Linux ISO download](https://www.archlinux.org/download/)
- [Arch Linux Install Guide](https://wiki.archlinux.org/index.php/Installation_guide)
- [Best Practices for running Linux on Hyper-V](https://docs.microsoft.com/en-us/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v)
- [Install Arch Linux on Hyper-V](https://medium.com/@mudrii/install-arch-linux-on-windows-10-hyper-v-215b2e71c6db)
