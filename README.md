# retroload

[RetroLoad.com](https://retroload.com/) is a web application for converting tape images of historical 8 bit computers into sound for loading them on real devices using an audio line cable or cassette adapter.

This repository contains

- **retroload-cli**, a command line interface for converting tape images to WAVE files or playing them using the speaker module
- **retroload-common**, the base library used by [RetroLoad.com](https://retroload.com/) and retroload-cli
- **retroload-examples**, a collection of example tape files that have successfully been converted and tested on real machines including their build scripts (Basic or Assembler). These examples are used by retroload-common's unit tests to prevent regressions. 

**Project state:** Right now everything is work in progress. Only some of the formats are currently considered as working.

