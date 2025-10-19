; retroload.com
; example program for KC 85/4
; to be assembled using z80asm

; definitions for CAOS 4.2

	; "Programmverteiler 1"; routine specified in code followed by the call
	PV1:	equ 0xf003
	; CAOS routines
	OSTR:	equ 0x23 ; output string routine
	TON:	equ 0x35 ; output sound routine
	; memory locations for passing arguments to TON routine
	ARG1:	equ 0xb782
	ARG2:	equ 0xb784
	ARG3:	equ 0xb786

; load address
	OFFSET:	equ 0x0200

; kcc file header

PROGRAMNAME:
	dm	"RL" ; program name (max. 8 chars)
	ds	8-$-PROGRAMNAME ; pad with 0
	dm	"COM" ; filetype
	db	0x00 ; reserved
	db	0x00
	db	0x00
	db	0x00
	db	0x00
	db	0x02
	dw	OFFSET ; load address
PROGRAMLENGTH:
	dw	0x0000 ; gets overwritten at the end
	ds	128-$ ; pad header block with 0

	org	OFFSET

; caos menu entry

	dw	0x7f7f ; magic menu prefix
	dm	"RL"
	db	0x01

; actual program

	call	PV1
	db	OSTR
	dm	"\r\n"
	dm	"---------------------------------\r\n"
	dm	"\r\n"
	dm	"RETROLOAD.COM\r\n"
	dm	"\r\n"
	dm	"EXAMPLE FOR KC 85/4\r\n"
	dm	"\r\n"
	dm	"LOADED AND EXECUTED!\r\n"
	dm	"\r\n"
	dm	"---------------------------------\r\n"
	dm	"\0"

	ld	hl, MELODY
NEXTNOTE:
	; frequency (time constant)
	ld	a, (hl)
	cp	0
	ret	z ; end of melody: return to main menu
	ld	(ARG1), a ; time constant 1
	ld	(ARG2), a ; time constant 2
	; divider
	ld	a, 0
	ld	(ARG1+1), a
	ld	(ARG2+1), a
	; duration (= value * 20 ms)
	inc	hl
	ld	a, (hl)
	ld	(ARG3+1), a
	; volume (0x00 - 0x1f)
	ld	a, 0x1f
	ld	(ARG3), a
	; call os routine
	push	hl
	call	PV1
	db	TON
	pop	hl

	inc	hl
	jr	NEXTNOTE

MELODY:
	dw	0x1080
	dw	0x1040
	dw	0x1020
	db	0


; pad to multiple of 128 (not sure why it doesn't accept % here...)
	ds	2*128 - $ + OFFSET

; write program length to file header

	seek PROGRAMLENGTH
	dw	$

	end