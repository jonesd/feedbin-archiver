Feedbin Article Archiver
========================

Archive a local copy of online posts collected by Feedbin. Solves the problem of web content going offline. The local copy can also be used for local searching and processing.

Install
-------

Download your Starred items for FeedBin, and unzip the result. Should have a Starred.json file.

Install NodeJS 6 or newer.

    $ npm install
    $ node lib/feedbin-archive archive-starred Starred.json


Commad Line Help
----------------

    $ node lib/feedbin-archive -h

    Usage: lib/feedbin-archiver.js [options] <archive directory> <source.json>

    Options:
      -t, --template  Article HTML output template                          [string]
      -v, --verbose   Verbose logging                                      [boolean]
      -h, --help      Show help                                            [boolean]
      --version       Show version number                                  [boolean]


