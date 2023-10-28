; retroload.com
; example program for Acorn Electron (BASIC)
; to be assembled using z80asm
;
; Load:
;   LOAD ""
;
; Run:
;   RUN
;
; Load and run:
;   CHAIN ""

    B_LINE_PREFIX: equ 0x0d

    B_PRINT: equ 0xf1 ; basic token for PRINT
    B_CHR: equ 0xbd ; basic token for CHR$

L10:
    db  B_LINE_PREFIX
    db  0 ; line number hi
    db  10 ; line number low
    db  L20-L10 ; length
    db  B_PRINT
    dm  "\"-------------------------------------\""
L20:
    db  B_LINE_PREFIX
    db  0
    db  20
    db  L30-L20
    db  B_PRINT
L30:
    db  B_LINE_PREFIX
    db  0
    db  30
    db  L40-L30
    db  B_PRINT
    dm  "\"RETROLOAD.COM\""
L40:
    db  B_LINE_PREFIX
    db  0
    db  40
    db  L50-L40
    db  B_PRINT
L50:
    db  B_LINE_PREFIX
    db  0
    db  50
    db  L60-L50
    db  B_PRINT
    dm  "\"EXAMPLE FOR ACORN ELECTRON (BASIC)\""
L60:
    db  B_LINE_PREFIX
    db  0
    db  60
    db  L70-L60
    db  B_PRINT
L70:
    db  B_LINE_PREFIX
    db  0
    db  70
    db  L80-L70
    db  B_PRINT
    dm  "\"LOADED AND EXECUTED!\""
L80:
    db  B_LINE_PREFIX
    db  0
    db  80
    db  L90-L80
    db  B_PRINT
L90:
    db  B_LINE_PREFIX
    db  0
    db  90
    db  L100-L90
    db  B_PRINT
    dm  "\"-------------------------------------\""
L100:
    db  B_LINE_PREFIX
    db  0
    db  100
    db  END-L100
    db  B_PRINT
    db  B_CHR
    dm  "(7)"
END:


; end marker
    db  0x0d
    db  0xff

    end
