; Load:
; L 0100 0200
;
; Run:
; J 0100

  OFFSET: equ 0x0100

; monitor routines

  OUTCH:  equ 0x00

; headersave header for .z80 files

LOAD_ADDRESS:
  dw  OFFSET
END_ADDRESS:
  dw  0x0000 ; filled after assembling
START_ADDRESS:
  dw  OFFSET
  ds  6 ; additional information (?)
  db  0x43 ; type (?)
  ds  3, 0xd3 ; header identifier
  dm  "RL              " ; filename

; actual program

  org OFFSET

LOOP:
  ld  a, 'X'
  rst 0x20
  db  OUTCH
  jp  LOOP
  ; ret TODO

  ds	1*32 - $ + OFFSET ; pad to multiple of 32

  ; TODO: end address is to big? or not enough padding?
	seek END_ADDRESS
	dw	$


