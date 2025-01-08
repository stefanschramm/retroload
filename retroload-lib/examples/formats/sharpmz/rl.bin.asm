; retroload.com
; example program for Sharp MZ-700
; to be built using z80asm
;
; Load: L
; Run: J1200
; 

	OFFSET:	equ 0x1200

	; monitor rom routines
	BELL:	equ 0x003e
	PRINTS:	equ 0x0012
	GETL:	equ 0x0003

	org	OFFSET

; program
	ld	hl, GREETING
	call	PRINTSTRING
	call	BELL
	call	GETL
	jp	0x0000

PRINTSTRING:
	; using our own routine because the monitor's MSG routine ignores the carriage returns
	; beginning of string in HL
	ld	a, (hl)
	cp	0
	ret	z
	push	hl
	call	PRINTS
	pop	hl
	inc	hl
	jp	PRINTSTRING

GREETING:
	dm	"\r"
	dm	"---------------------------------\r"
	dm	"\r"
	dm	"RETROLOAD.COM\r"
	dm	"\r"
	dm	"EXAMPLE FOR SHARP MZ-700 (BINARY)\r"
	dm	"\r"
	dm	"LOADED AND EXECUTED!\r"
	dm	"\r"
	dm	"---------------------------------\r"
	dm	"\r"
	dm	"PRESS RETURN TO RETURN TO MONITOR\r"
	db	0
