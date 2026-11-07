; retroload.com
; example program for Polycomputer-880
; to be assembled using z80asm
;
; Load: <FCT> <4> 4000 <EXEC> 4038 <EXEC>
;       (replace 4038 with length of program - 1)
; Run: <GO> 4000 <EXEC> <EXEC>

; bit values for 7-segment display
;         _____
;     64 / 32 / 128
;       /____/
;    1 / 16 / 4
;     /____/ . 8
;       2

; trying to map latin letters to the 7-segments

  A:  equ 1 + 64 + 32 + 16 + 128 + 4
  B:  equ 1 + 64 + 2 + 4 + 16
  C:  equ 32 + 64 + 1 + 2
  D:  equ 128 + 4 + 16 + 1 + 2
  E:  equ 64 + 1 + 32 + 16 + 2
  F:  equ 64 + 1 + 32 + 16
  G:  equ 32 + 64 + 1 + 2 + 4 + 16
  H:  equ 16 + 64 + 128 + 1 + 4 ; :/ H/X
  I:  equ 64 + 1
  J:  equ 1 + 2 + 4 + 128
  K:  equ 64 + 1 + 16 + 2 ; :/
  L:  equ 64 + 1 + 2
  M:  equ 1 + 16 + 4 ; :/ M/N
  N:  equ 1 + 16 + 4 ; :/ M/N
  O:  equ 64 + 32 + 128 + 4 + 2 + 1
  P:  equ 64 + 32 + 128 + 16 + 1
  Q:  equ 64 + 32 + 128 + 16 + 4
  R:  equ 1 + 16
  S:  equ 32 + 64 + 16 + 4 + 2
  T:  equ 32 + 128 + 4
  U:  equ 64 + 1 + 2 + 4 + 128
  V:  equ 1 + 2 + 4 ; :/ V/W
  W:  equ 1 + 2 + 4 ; :/ V/W
  X:  equ 16 + 64 + 128 + 1 + 4 ; :/ 128/X
  Z:  equ 32 + 128 + 16 + 1 + 2
  DOT:  equ 8
  SPACE:  equ 0
  MINUS:  equ 16

  ; monitor routine
  KONSOL: equ 0x014e ; output of 8 bytes (indexed by DE) to 7-segments display
  
  org 0x4000

START:
  ld de, GREETING
NEXT_CHARACTER:
  ld c, 0x20
WAIT:
  push bc
  push de
  call KONSOL
  ret nz ; key pressed
  pop de
  pop bc
  dec c
  jr nz, WAIT
  inc de
  ld hl, GREETING_END
  sbc hl, de
  jr nz, NEXT_CHARACTER
  jr START

GREETING:
  dm  SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE
  dm  MINUS, MINUS, MINUS
  dm  R, E, T, R, O, L, O, A, D
  dm  MINUS, MINUS, MINUS
GREETING_END:
  dm  SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE, SPACE
