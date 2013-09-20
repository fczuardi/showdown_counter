Counters
========

[![Build Status](https://travis-ci.org/fczuardi/showdown_counter.png?branch=master)](https://travis-ci.org/fczuardi/showdown_counter) ![dependencies](https://david-dm.org/fczuardi/showdown_counter.png)

Multiple counters for your mobile device
----------------------------------------

We are humans and we count things, from the drinks we had in a party to the
remaining points of blood in a card game, to the current row of the amigurumi
doll that we are crocheting.

With this mobile app you will be able to do that with the help of an elegant
user interface that is easy to use and don't get in your way.


Ubuntu App Showdown
-------------------

This application is competing on the [Ubuntu App Showdown](http://developer.ubuntu.com/showdown/) 2013, a contest hosted by Canonical to promote the development of
mobile apps for the Ubuntu Touch. I've chosen to develop it in HTML5 so other
platforms could benefit from it in the future (and because I am a web developer).

I am documenting my experience of developing this app and participating in the
contest on
[this blog](https://github.com/fczuardi/ubuntu_app_showdown/wiki)
and posting the link for the updates on the
[Ubuntu App Showdown Subreddit](http://www.reddit.com/r/ubuntuappshowdown)
as well.

Contributing
------------

You must have [git >= v1.8.2](http://git-scm.com/), [bundler](http://bundler.io/),
[node.js](http://nodejs.org/) and [grunt](http://gruntjs.com/) installed.

To install those on ubuntu:

### node.js

    $ sudo apt-get update
    $ sudo apt-get install python-software-properties python g++ make
    $ sudo add-apt-repository ppa:chris-lea/node.js
    $ sudo apt-get update
    $ sudo apt-get install nodejs

### bundler

    $ sudo apt-get install bundler

### grunt

    $ sudo npm install -g grunt-cli

After that:

    $ git clone https://github.com/fczuardi/showdown_counter.git && cd $_
    $ git submodule update --init --recursive lib/js/mozilla/pointer
    $ bundle install
    $ npm install
    $ grunt install
    $ grunt

