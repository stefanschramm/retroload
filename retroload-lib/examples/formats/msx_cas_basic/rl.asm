; retroload.com
; example program for MSX (tokenized basic)
; to be built using z80asm
;
; Load: cload
; Run: run
; List program: list

	OFFSET:	equ	0x8000

; block header
	dm 	0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74
	ds	10, 0xd3 ; header type: basic

; file name (6 bytes)
	dm	"RL    "

; block header
	dm 	0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74

DATA_START:

; tokenized basic
	incbin	'rl.bas'

; end of block, pad data to 256 bytes
	ds	0x100 + DATA_START - $, 0x00

END:
