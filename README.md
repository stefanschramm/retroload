# retroload

[RetroLoad.com](https://retroload.com/) is a web application for converting tape images of historical computers into sound for loading them on real devices using an audio line cable or cassette adapter.

This repository contains the npm packages

- **retroload**, a command line interface (CLI) for converting tape images to WAVE files or playing them,
- **retroload-lib**, the fundamental library used by the CLI and RetroLoad.com

**Project state:** A lot is still work in progress. Some of the (more complex) tape archive formats are only partly supported.

## Installation from NPM registry

    sudo npm install -g retroload

## Using retroload CLI

A list of available command line options can be shown using `retroload --help`.

[MACHINES.md](./MACHINES.md) contains some instructions on how to load tapes on different devices.

### Creating WAVE files

Convert an MSX tape archive into an audio file named example.wav:

    retroload retroload-lib/examples/formats/msx_binary/rl.cas -o example.wav

retroload will try to automatically determine the input format by its content and file extension. For formats that are not automatically detected, the `--format` option needs to be specified.

### Playing tape archives directly

When the `-o` option is omitted, retroload automatically tries to play the generated audio data.

## Example collection

[./retroload-lib/examples/formats](./retroload-lib/examples/formats) contains minimal example tape archives of different formats for different machines. Some of them, listed in [Examples.ts](./retroload-lib/src/Examples.ts), have successfully been loaded to real machines and can be used for testing. If the example files won't load on your machine, it's unlikely that any other tape archive will successfully load using retroload.

### Rebuilding examples

There is a Dockerfile that prepares an environment in which the examples can be (re)built. The container has to be started with the formats directory as bind mount to /formats.

Rebuilding all examples:

    cd retroload-lib/examples
    docker build -t retroload-examples .
    docker run -v "$(pwd)/formats:/formats" retroload-examples

Or enter the container to build individual examples:

    docker run -itv "$(pwd)/formats:/formats" retroload-examples /bin/bash
    cd /formats/msx_binary
    make clean
    make
    exit

If you want to build the examples without Docker, you can look up the Dockerfile for the required tools to be installed in your environment (assemblers, tape format converters).

## Installation from Git repository (development environment)

For development you can build and install retroload directly from the repository using npm link:

    git clone https://github.com/stefanschramm/retroload.git
    cd retroload
    npm ci # install dependencies
    npm run build # calls TypeScript "compiler"
    sudo npm link retroload/ # the "/" is important!

Later you can remove the symlinks by

    sudo npm unlink retroload -g
