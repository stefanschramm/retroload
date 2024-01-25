# retroload

retroload is a command line utility for converting tape archive files of historical computers into sound for loading them on real devices using an audio line cable or cassette adapter.
It is backed by the same library that is used by the web application [RetroLoad.com](https://retroload.com/).

## Installation

Use the package manager npm to install the latest release:

    sudo npm install -g retroload

## Usage (example)

Create a WAV file example.wav from a tape archive example.cas file by calling

    retroload example.cas -o example.wav

or directly play the resulting audio with

    retroload example.cas

retroload will try to automatically determine the input format by its content and file extension.
For formats that are not automatically detected, the `--format` and/or `--machine` options need to be specified.

The list of supported formats and further usage instructions can be obtained by using the integrated help:

    retroload --help

## Documentation

Latest documentation is available at the [GitHub project page](https://github.com/stefanschramm/retroload).

## Supported devices

Currently tape archive formats for the following systems are supported: Acorn Electron, Amstrad CPC, Atari 800, BASICODE, Commodore C64/VIC-20, MME LC80, MSX, Mühlhausen KC 85/2-4, Robotron KC 85/1 etc., Sinclair ZX Spectrum, Sinclair ZX81, Thomson MO5, Triumph Adler alphatronic PC, TI-99/4A, Z1013
