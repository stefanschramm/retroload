; retroload.com
; example program for KC 85/1
; to be assembled using z80asm
;
; Loading: RL<ENTER><ENTER>

BOS:	equ	0x0005 ; entry for all OS routines
CONSO:	equ	2 ; OS routine

	org	0x0300

	jp	MAIN
	db	'RL      ',0
	db	0

MAIN:
	ld	hl, GREETING
	call	PRINTSTRING
	ret

PRINTSTRING:
	; beginning of string in HL
	ld	a, (hl)
	cp	0
	ret	z
	ld	c, CONSO
	ld	e, a
	call	BOS
	inc	hl
	jp	PRINTSTRING

GREETING:
	dm	"\r\n"
	dm	"---------------------------------\r\n"
	dm	"\r\n"
	dm	"RETROLOAD.COM\r\n"
	dm	"\r\n"
	dm	"EXAMPLE FOR KC 85/1\r\n"
	dm	"\r\n"
	dm	"LOADED AND EXECUTED!\r\n"
	dm	"\r\n"
	dm	"---------------------------------\r\n"
	db	7 ; bell
	db	0
