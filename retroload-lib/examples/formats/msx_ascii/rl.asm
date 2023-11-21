; retroload.com
; example program for MSX
; to be built using z80asm
;
; Load and run: run"cas:"
;
; Load: load"cas:"
; Run: run

; block header
	dm 	0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74
	ds	10, 0xea ; header type: ascii

; file name (6 bytes)
	dm	"RL    "

; block header
	dm 	0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74

; basic program (ascii)
DATA_START:

  incbin "rl.txt"

; end of block, pad data to 256 bytes
	ds	0x100 + DATA_START - $, 0x1a
