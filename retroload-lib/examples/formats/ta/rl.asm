; retroload.com
; example program for TA alphatronic PC (Basic)
; to be assembled using z80asm
;
; Load:
;	 cload
;
; Run:
;	 run

B_PRINT: equ 0x91 ; basic token for PRINT

OFFSET:	equ 0x6000

	org OFFSET

START:
	dw	L20, 10	; next line pointer, current line number
	db	B_PRINT
	dm	":"
	db	B_PRINT
	dm	"\"-------------------------------------\":", B_PRINT
	db	0 ; end of line
L20:
	dw	L30, 20
	db	B_PRINT
	dm	"\"RETROLOAD.COM\":", B_PRINT
	db	0
L30:
	dw	L40, 30
	db	B_PRINT
	db	"\"EXAMPLE FOR TA alphatronic PC (BASIC)\":", B_PRINT
	db	0
L40:
	dw	L50, 40
	db	B_PRINT
	dm	"\"LOADED AND EXECUTED!\":", B_PRINT
	db	0
L50:
	dw	L60, 50
	db	B_PRINT
	dm	"\"-------------------------------------\":", B_PRINT, "\"", 0x07, "\"" ; beep!
	db	0
L60:
	db	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00

	end
