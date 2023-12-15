The following machines are used for testing the [examples](./retroload-lib/examples/formats). The list is supposed to be an overview about the different methods to load tapes.

The volume levels are just meant to be a rough orientation based on experiments (e.g. the ZX 81 wants a higher volume than the Acorn Electron).

# Acorn Electron

Volume: 40 %

Load and run BASIC program:

    CHAIN ""

or

    LOAD ""
    RUN

Load data at a specific memory location `0x1000` (ignores data specified in tape header):

    *LOAD "" 1000

Call a binary program located at memory location `0x1000`:

    CALL &1000

Load and run a binary program (uses load and entry location from tape header):

    *RUN

# Atari 800 XL

    (Start)+(Power on)
    (Play)
    (any key)

Text (ATASCII) files:

    ENTER "C:"

# C64, C64 C, VIC 20/VC 20

Volume VIC 20: 40 % (using cassette adapter side B)

Load and run a BASIC program or machine language program with autostart loader:

    RUN ""

Load and run machine language program (prg)

    LOAD
    (any key)
    SYS 4352

4353 (0x1100) is the entry address of the program in memory.

For C64 etc. any key has to be pressed as soon as the "FOUND"-message is shown.
The VIC 20 will automatically load the first record found.

# CPC 464

Volume: 60 % (using cassette adapter)

Load from cassette and run:

    run ""

Load at specific memory location and run:

    memory &2000
    load "", &2000
    call &2000

# KC 85/1, KC 87, Z 9001

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

BASIC ASCII listings can be loaded (within BASIC) using

    LOAD#1 "EXAMPLE"

**BASICODE**

The BASCODER `bac87_sss.tap` can be used to load and run BASICODE programs:

    BASIC
    CLOAD" "
    *L

Menu commands for BASICODE-3 Version 1.4 A. + U. Zierott:

    * - BASICODE menu
    *L - Load, translate and start
    *A - Read ASCII file
    *W - Save ASCII file
    *T - Translate ASCII file --> BASIC
    *C - Translate BASIC --> ASCI file
    *K - List ASCII file

# KC 85/3, KC 85/4

Volume: 20 % (tested with KC 85/4)

Machine programs can be loaded from the main menu:

    LOAD
    MENU

Most programs create a new menu entry that can be called then.

For BASIC programs (.SSS files) the BASIC interpreter needs to be started first (using `BASIC` and pressing Enter at the "MEMORY END ? :"-Prompt). Then files can be loaded by:

    CLOAD"EXAMPLE"

For files having no (an empty) name can be loaded using `CLOAD" "` (note the space between the quotation marks).

From within BASIC, `BLOAD` can be used to load machine programs.

**BASICODE**

For KC 85/4 the BASCODER `BAC854C.SSS` can be used to load and run BASICODE programs:

    BASIC
    CLOAD" "
    *L

Menu commands for BASICODE-3C Version 1.5 KC 85/4 A. + U. Zierott, R. Wenzel:

    * - BASICODE menu
    *L - Load, translate and start
    *A - Read ASCII file
    *W - Save ASCII file
    *T - Translate ASCII file --> BASIC
    *C - Translate BASIC --> ASCI file
    *K - List ASCII file

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

Volume: 40 %

Programs can be loaded and started using one of the following methods:

    run "cas:"

or

    cload
    run

or

    bload "cas:",r

**BASICODE**

The BASCODER `BASICODE-3 (1987)(NOS)(NL).cas` can be used to load and run BASICODE programs.

Load and run BASICODE-3:

    bload"cas:",r

Then the BASICODE audio can be loaded using schema `A` ("Basicode progr >>> Basicode 3 vertaler >>> Basic") and pressing `ESC`.
The BASCODER will then exit to BASIC and the loaded program can be `run`.
With `cmd` the menu can be entered.

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

# TI-99/4A

Volume: 60 % (using line cable)

Pinout of D-Sub-9 connector: 8 = Audio In, 9 = Audio In Ground, 3 = Audio Out, 5 = Audio Out Ground

Loading a BASIC program:

    OLD CS1

The command is case-sensitive (all caps)!

Then `ENTER` twice, play the "tape", and one more `ENTER` once loading has finished.

The loaded program can be started using

    RUN

If loading succeeds, but BASIC complains about an incorrect statment (and the program's `LIST`ing contains garbage), the program is likely for "TI Extended BASIC" (which is available as a cartridge) and not the integrated "TI BASIC".

# Z 1013

Volume: 40 % (using line cable)

The load command `L` takes the load and end address as hexadecimal numbers (here `1000` and `108F`) . `J` starts a program at the specified address (here `1000`).

    L 1000 108F
    J 1000

The monitor image does not change while loading. The sound can be heared on the TV when using the HF cable. After successful loading, the `#`-prompt is displayed.

**Headersave**

Headersave (.z80) files have an additional header containing the record name, start address, end address and entry address. To load these files, the Headersave program needs to exist in memory (either in ROM or loaded from tape).

Headersave (e.g. `C.HEADERSAVE 5.95.z80`) can be loaded using `L 3C00 3FFF` and initialized by `J 3FEE`. Then .z80 files can be loaded using the `@L` command.

As an alternative, RetroLoad allows removing the Headersave header using the `--noheadersave` option to allow the usage of standard monitor commands. Then the load and end addresses need to be specified manually to the `L` command and the entry address to the `J`command.

# ZX 81

Volume: 60 % (using line cable)

Load a BASIC program:

    LOAD ""

(`J`, `Shift`+`P`, `Shift`+`P`, `New Line`)

In case the program is not auto-starting:

    RUN

(`R`, `New Line`)

# ZX Spectrum+

Volume: 80 % (using line cable)

BASIC programs can be loaded and started by

    LOAD ""
    RUN

(`J`, `"`, `"`, `ENTER`, ..., `R`, `ENTER`)

Note: Some programs may start automatically after loading.

Machine language programs can loaded by

    LOAD "" CODE

(`J`, `"`, `"`, `EXTEND MODE`, `I`, `ENTER`)

...and started by

    PRINT USR 32768

(`P`, `EXTEND MODE`, `L`, `ENTER`)

where `32768` is their entry address.

