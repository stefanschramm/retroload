; retroload.com
; example program for MSX
; to be built using z80asm
;
; Load and run: bload"cas:",r
;
; Load only: bload"cas:"
; 

	OFFSET:	equ	0x8000

	CHPUT:	equ	0x00a2 ; bios rom routine

; block header
	dm 	0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74
	ds	10, 0xd0 ; header type: binary

; file name (6 bytes)
	dm	"RL    "

; block header
	dm 	0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74

	dw	OFFSET ; load address
	dw	OFFSET + END - START - 1; end address
	dw	OFFSET ; exec address

START:

	incbin "rl.bin"

END:

; no padding required for binary data
