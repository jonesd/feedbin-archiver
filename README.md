Feedbin Starred Article Archiver
================================

Archive a local copy of online starred posts collected by Feedbin. Solves the problem of web content going offline. The local copy can also be used for local searching and processing.

# Download Starred Articles

The archiver processes a starred.json as downloaded from Feedbin.

- Browse to https://feedbin.com
- Login
- From the Settings Menu, choose Import/Export
- Click Starred Articles Export

This will trigger the creation of the export file. After a few minutes an email with a download link will be sent to you. Download the referenced file to your machine.

You should end up with

# Docker

The easiest way to run the archiver is to use the Docker image.

    $ docker....

Where archive-starred is a directory where the downloaded articles will be stored, and Starred.json is the unzipped starred email accesible from the feedbin email.

On linux you can define a bash function to make it easier to run:




# Build and Run

Download your Starred items for FeedBin, and unzip the result. Should have a Starred.json file.

Install NodeJS 6 or newer.

    $ npm install
    $ node lib/feedbin-archive archive-starred Starred.json


# Command Line Help

    $ node lib/feedbin-archive -h

    Usage: lib/feedbin-archiver.js [options] <archive directory> <source.json>

    Options:
      -t, --template  Article HTML output template                          [string]
      -f, --force     Download article eve if local copy exists            [boolean]
      -v, --verbose   Verbose logging                                      [boolean]
      -h, --help      Show help                                            [boolean]
      --version       Show version number                                  [boolean]


Copyright 2017 David G Jones