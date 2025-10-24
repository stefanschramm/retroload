; retroload.com
; example program for Microprofessor MPF-1
; to be assembled using z80asm
;
; Load: <TAPE RD>FFFF<GO>
; Run: <ADR>1800<GO>


; bit values for 7-segment display
;         ____
;      4 / 8 / 16
;       /___/
;    1 / 2 / 32
;     /___/ . 64
;      128

; trying to map latin letters to the 7-segments

  A: equ 1 + 4 + 8 + 2 + 16 + 32
  D: equ 1 + 2 + 128 + 32 + 16
  E: equ 1 + 4 + 8 + 2 + 128
  L: equ 4 + 1 + 128
  O: equ 1 + 4 + 8 + 16 + 32 + 128
  R: equ 1 + 2
  T: equ 8 + 16 + 32
  SPACE: equ 0
  MINUS: equ 2

; monitor routines
  SCAN1: equ 0x0624 ; output of 6 bytes (indexed by IX) to 7-segments display
  TONE: equ 0x05e4 ; frequency in C, length in HL

  org 0x1800

START:
  ld c, 0x80
  ld hl, 0x0020
  call TONE
  ld c, 0
  ld ix, GREETING_END - 6
NEXT:
  ld d, 0x40
WAIT:
  call SCAN1
  dec d
  cp d
  jr nz, WAIT

  dec ix
  inc c
  ld a, GREETING_END - GREETING - 6 ; = length
  cp c
  jr z, START
  jr NEXT

; text needs to be written in reverse
GREETING:
  dm SPACE, SPACE, SPACE, SPACE, SPACE, SPACE
  dm MINUS, MINUS, MINUS
  dm D, A, O, L, O, R, T, E, R
  dm MINUS, MINUS, MINUS
  dm SPACE, SPACE, SPACE, SPACE, SPACE, SPACE
GREETING_END:
