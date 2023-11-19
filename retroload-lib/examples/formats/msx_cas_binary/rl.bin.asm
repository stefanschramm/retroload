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

	org	OFFSET

; program
START:
	ld	hl, GREETING
	call	PRINTSTRING

	ret

PRINTSTRING:
	; beginning of string in HL
	ld	a, (hl)
	cp	0
	ret	z
	push	hl
	call	CHPUT
	pop	hl
	inc	hl
	jp	PRINTSTRING

GREETING:

	dm	"\r\n"
	dm	"---------------------------------\r\n"
	dm	"\r\n"
	dm	"RETROLOAD.COM\r\n"
	dm	"\r\n"
	dm	"EXAMPLE FOR MSX (BINARY)\r\n"
	dm	"\r\n"
	dm	"LOADED AND EXECUTED!\r\n"
	dm	"\r\n"
	dm	"---------------------------------\r\n"
	db	7 ; bell
	db	0

END:
