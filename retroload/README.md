# retroload

retroload is a command line utility for converting tape archive files of historical computers into sound for loading them on real devices using an audio line cable or cassette adapter.
It is backed by the same library that is used by the web application [RetroLoad.com](https://retroload.com/).

## Installation

Use the package manager npm to install the latest release:

    sudo npm install -g retroload

## Usage

Create a WAV file from a MSX .cas tape archive by calling

    retroload example.cas -o example.wav

or directly play the resulting audio with

    retroload example.cas

retroload will try to automatically determine the input format by its content and file extension.
For formats that are not automatically detected, the `--format` and/or `--machine` options need to be specified.

Further usage instructions can be obtained by using the integrated help:

    retroload --help

## Documentation

Latest documentation is available at the [GitHub project page](https://github.com/stefanschramm/retroload).
