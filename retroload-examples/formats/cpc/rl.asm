; retroload.com
; example program for CPC 464
; to be built using z80asm
;
; Load:
;  memory &2000
;  load "", &2000
; Run:
;  call &2000

TXT_OUTPUT:	equ	0xbb5a

	org	0x2000

	ld	bc, GREETING
	call	PRINTSTRING

	ret

PRINTSTRING:
	ld	a, (bc)
	cp	0
	ret	z
	call	TXT_OUTPUT
	inc	bc
	jr	PRINTSTRING

GREETING:

	dm	"\r\n"
	dm	"-------------------------------\r\n"
	dm	"\r\n"
	dm	"RETROLOAD.COM\r\n"
	dm	"\r\n"
	dm	"EXAMPLE FOR CPC 464\r\n"
	dm	"\r\n"
	dm	"LOADED AND EXECUTED!\r\n"
	dm	"\r\n"
	dm	"-------------------------------\r\n"
	dm	"\r\n"
	db	0
