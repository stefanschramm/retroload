The following machines are used for testing the [examples](./retroload-examples/formats). The list is supposed to be an overview about the different methods to load tapes.

The volume levels are just meant to be a rough orientation based on experiments (e.g. the ZX 81 wants a higher volume than the Acorn Electron).

# Acorn Electron

Volume: 40 %

Load and run program:

    CHAIN ""

or

    LOAD ""
    RUN

# Atari 800 XL

    (Start)+(Power on)
    (Play)
    (any key)

Text (ATASCII) files:

    ENTER "C:"

# C64, C64 C

Load and run a basic program or machine language program with autostart loader:

    RUN ""

Load and run machine language program (prg)

    LOAD
    (any key)
    SYS 4352

4353 (0x1100) is the entry address of the program in memory.

# CPC 464

Volume: 60 % (using cassette adapter)

Load from cassette and run:

    run ""

Load at specific memory location and run:

    memory &2000
    load "", &2000
    call &2000

# KC 85/1, KC 87, Z 9000

Volume: 40 % (tested with KC 87.11)

Entering a name (here `EXAMPLE`) that is not yet available as command will cause the machine to load and excute it from tape:

    EXAMPLE
    (return)

or

    EXAMPLE.COM
    (return)

Specifiying the extension is optional. Note the additional Return after the message "start tape" appeared!

Loading a program without starting it:

    CLOAD EXAMPLE
    (return)

or

    CLOAD EXAMPLE.COM
    (return)

The command name can be different than the file name that was used to store the program on tape.

For BASIC files (usually .SSS file extension), the BASIC interpreter has to be started first. Then programs can be loaded like this:

    CLOAD "EXAMPLE"


# KC 85/3, KC 85/4

Volume: 20 % (tested with KC 85/4)

Machine programs can be loaded from the main menu:

    LOAD
    MENU

Most programs create a new menu entry that can be called then.

For BASIC programs (.SSS files) the BASIC interpreter needs to be started first (using `BASIC` and pressing Enter at the "MEMORY END ? :"-Prompt). Then files can be loaded by:

    CLOAD"EXAMPLE"

For files having no (an empty) name can be loaded using `CLOAD" "` (note the space between the quotation marks).

From within BASIC, `BLOAD` can be used to machine programs.

# LC 80

The file name consist of 4 hexadecimal digits (here `FFFF`). After loading, the machine can be reset and the program can be run by specifying the entry address (here `2000`).

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

# Thomson MO5

Volume: 25 % (using cassette adapter)

Load and run BASIC program:

    LOAD"",R

or

    LOAD
    RUN

Load and run machine language program:

    LOADM"",,R

Load machine language program:

    LOADM""

Run machine language program (with entry point `2700`, hexadecimal):

    EXEC &H2700

# Z 1013

The load command `L` takes the load and end address as hexadecimal numbers (here `0100` and `018F`) . `J` starts a program at the specified address (here `0100`).

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

