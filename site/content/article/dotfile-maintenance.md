---
title: "Dotfile Maintenance"
date: 2018-11-12
publishDate: 2018-11-12
archives: "2018"
tags: ["dotfiles", "vim", "github"]
---
Here is a party I'm a bit late in joining. And it is one of those ideas that makes you smack your head wondering why you didn't think of it.

## Config file tweaks

For years, I've maintained a tar.Z bundle that contains a .profile, .cshrc, .bashrc, .vimrc etc. You can tell how old it is by the fact that I still maintain it with compress rather than gzip. When I started it, gzip did not exist. And even after it did, I could not be sure that a system would have it installed. There are a few zillion copies of it lying around on various drives and removable media. Needless to say, each one is slightly different and it may be hard to figure out which is the "latest".

But with the advent of github, why not use that to store and version control those files?

Github has a [nice round up of various systems](https://dotfiles.github.io) to do just that.

The idea is rather simple. The "actual" dotfiles live in a git repository that can be cloned and updated. What lives in your home directory is a symlink.

It can get fancier with some of the frameworks allowing you store the files as fragments that get built into a single unit. That allows you to group all the settings for e.g. fzf in one place rather than having to go hunt them down in all the various place they might reside (.vimrc, .bash_profile, etc).

Or, if you don't like all the symlinking, you can [make your entire home directory the repository](https://developer.atlassian.com/blog/2016/02/best-way-to-store-dotfiles-git-bare-repo/) .

Note that you might still need need to render the repository down to a tarball to get it on a system if the company admin does not allow connection to github - a not unusual security stance to take, mostly to keep things from moving from the system to github.

## Getting Started

For something simple to get your feet wet, I would suggest [Jeff Coffler's skeleton](https://github.com/jeffaco/dotfiles).

Jeff has organized things by system (\*nix/Win/Mac) and then by subsystem (bash, git, vim), though that second level can actually be organized anyway you want.

Fork his repository into one of your own, clone it to your system. Copy your original dotfiles into the working directory (remember to rename them to remove the dot) and run the bootstrap.sh. Commit; push; you're done.

One particular file to watch out for is nix/git/gitconfig. It has Jeff's name and email and some other stuff that you will probably not want. So, be sure to copy your config over top.

## Dot directories

**Edit: This fix has been added to the upstream version now.**

There is a minor flaw in the bootstrap.sh script that makes it play rough if you have a dot directory (e.g. .vim) that is a symlink. The script will delete the symlink as "stale" since it assumes all such dot things should be files. You can grab the version from [my dotfiles](https://github.com/mhhollomon/dotfiles) as a fix. I will be working to get Jeff to make the change in his copy as well.

## Vim packages as submodules

[This is a good tutorial](https://shapeshed.com/vim-packages/) on how to manage you vim packages as submodules of your dotfiles repo. I really don't have anything to add. I am using this method to handle [NERDtree](https://github.com/scrooloose/nerdtree) and [lightline](https://github.com/itchyny/lightline.vim)

