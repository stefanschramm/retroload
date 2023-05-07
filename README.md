# retroload

[RetroLoad.com](https://retroload.com/) is a web application for converting tape images of historical 8 bit computers into sound for loading them on real devices using an audio line cable or cassette adapter.

This repository contains

- **retroload-basic**, some experiments for BASIC tokenization
- **retroload-cli**, a command line interface for converting tape images to WAVE files or playing them using the speaker module
- **retroload-common**, common helper class(es)
- **retroload-encoders**, library containing the actual code for encoding (used by retroload-cli and [RetroLoad.com](https://retroload.com/))
- **retroload-examples**, a collection of example tape files that have successfully been converted and tested on real machines including their build scripts (BASIC or Assembler). These examples are used by retroload-encoder's unit tests to prevent regressions.

**Project state:** A lot is still work in progress. Some of the (more complex) tape archive formats are only partly supported.


## Installation from Git repository (development environment)

Since the retroload packages are not yet published to the npm registry, they currently need to be installed from the code repository:

    git clone https://github.com/stefanschramm/retroload.git
    cd retroload
    npm ci # install dependencies
    npm run build # calls TypeScript "compiler"
    sudo npm link retroload-cli/ # the "/" is important!

Now, the retroload CLI should be available in your path:

    retroload --help

Later you can remove the symlinks by

    sudo npm unlink retroload-cli -g

## Using retroload-cli

A list of available command line options can be shown using `retroload --help`.

[MACHINES.md](./MACHINES.md) contains some instructions on how to load tapes on different devices.

### Creating WAVE files

Convert an MSX tape archive into an audio file named example.wav:

    retroload retroload-examples/formats/msx_cas_binary/rl.cas -o example.wav

retroload will try to automatically determine the input format by its content and file extension. For formats that are not automatically detected, the `--format` and/or `--machine` options need to be specified.

### Playing tape archives directly

When the `-o` option is omitted, retroload automatically tries to play the generated audio data using the [speaker library](https://www.npmjs.com/package/speaker).

## Example collection

[./retroload-examples/formats](./retroload-examples/formats) contains minimal example tape archives of different formats for different machines. Some of them, listed in [index.js](./retroload-examples/index.js), have successfully been loaded to real machines and can be used for testing. If the example files won't load on your machine, it's unlikely that any other tape archive will successfully load using retroload.

### Rebuilding examples

There is a Dockerfile that prepares an environment in which the examples can be (re)built. The container has to be started with the formats directory as bind mount to /formats.

Rebuilding all examples:

    cd retroload-examples
    docker build -t retroload-examples .
    docker run -v "$(pwd)/formats:/formats" retroload-examples

Or enter the container to build individual examples:

    docker run -itv "$(pwd)/formats:/formats" retroload-examples /bin/bash
    cd /formats/msx_cas_binary
    make clean
    make
    exit

If you want to build the examples without Docker, you can look up the Dockerfile for the required tools to be installed in your environment (assemblers, tape format converters).

