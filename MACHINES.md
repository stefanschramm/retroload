The following machines are used for testing the [examples](./retroload-examples/formats). The list is supposed to be an overview about the different methods to load tapes.

# Atari 800 XL

    (Start)+(Power on)
    (Play)
    (any key)

Text (ATASCII) files:

    ENTER "C:"

# C64

Load and run a basic program or machine language program with autostart loader:

    RUN ""

Load and run machine language program (prg)

    LOAD
    (any key)
    SYS 4352

4353 (0x1100) is the entry address of the program in memory.

# C64 C

see C64

# CPC 464

Volume: 60 % (using cassette adapter)

Load from cassette and run:

    run ""

Load at specific memory location and run:

    memory &2000
    load "", &2000
    call &2000

# KC 85/1

Entering a program name (here `EXAMPLE`) that is not yet loaded will cause the machine to load it from tape:

    EXAMPLE
    (return)

# KC 85/3

    LOAD
    MENU

in Basic (for .SSS files):

    CLOAD "EXAMPLE"

# KC 85/4

see KC 85/3


# LC 80

The file name consist of 4 hexa-decimal digits (here `FFFF`). After loading, the machine can be reset and the program can be run by specifying the entry address (here `2000`).

    (LD)
    FFFF
    (EX)
    (RES)
    (ADR)
    2000
    (EX)

# MSX - Philips VG 8020

Programs can be loaded and started using one of the following methods:

    run "cas:"

or

    cload
    run

or

    bload "cas:",r

# TA alphatronic PC

    cload
    run

# Z 1013

The load command `L` takes the load and end address as hexadeciman numbers (here `0100` and `018F`) . `J` starts a program at the specified address (here `0100`).

    L 0100 018F
    J 0100

# ZX 81

Volume: 60 % (using line cable)

    LOAD ""

(`J`, `Shift`+`P`, `Shift`+`P`, `New Line`)

In case the program is not auto-starting:

    RUN

(`R`, `New Line`)

# ZX Spectrum+

Basic programs can be loaded and started by

    LOAD ""
    RUN

Machine language programs can be started by

    LOAD "" CODE
    PRINT USR 32768

where `32768` is their entry address.

