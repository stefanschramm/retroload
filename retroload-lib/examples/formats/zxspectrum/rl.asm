; retroload.com
; example program for Sinclair ZX Spectrum+ (Assembler)
; to be built using z80asm
;
; Load: LOAD "" CODE
; Run: PRINT USR 32768

	org	0x8000

	ld	bc, GREETING

PRINTSTRING:
	ld	a, (bc)
	cp	0
	ret	z
	rst	0x10
	inc	bc
	jr	PRINTSTRING

GREETING:

	dm	"\r"
	dm	"-------------------------------\r"
	dm	"\r"
	dm	"RETROLOAD.COM\r"
	dm	"\r"
	dm	"EXAMPLE FOR ZX SPECTRUM (BIN)\r"
	dm	"\r"
	dm	"LOADED AND EXECUTED!\r"
	dm	"\r"
	dm	"-------------------------------\r"
	dm	"\r"
	db	0
