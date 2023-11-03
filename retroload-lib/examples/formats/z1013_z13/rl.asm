; retroload.com
; example program for Z 1013
; to be assembled using z80asm
;
; Load: L 1000 108F
; Run: J 1000

	OFFSET: equ 0x1000

	OUTCH:  equ 0x00 ; OS routine

	org OFFSET

	ld 	hl, GREETING
	call 	PRINTSTRING

	ret

PRINTSTRING:
	; beginning of string in HL
	ld	a, (hl)
	cp	0
	ret	z
	rst	0x20
	db	OUTCH
	inc	hl
	jp	PRINTSTRING

GREETING:
	dm	"\r"
	dm	"-------------------------------\r"
	dm	"\r"
	dm	"RETROLOAD.COM\r"
	dm	"\r"
	dm	"EXAMPLE FOR Z 1013\r"
	dm	"\r"
	dm	"LOADED AND EXECUTED!\r"
	dm	"\r"
	dm	"-------------------------------\r"
	dm	"\r"
	db	0

	ds	5*32 - $ + OFFSET ; pad to multiple of 32 (modulo not working?)
