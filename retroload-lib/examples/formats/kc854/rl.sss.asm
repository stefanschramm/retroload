; retroload.com
; example program for KC 85/4 (Basic)
; to be assembled using z80asm
;
; Load:
;   BASIC
;   CLOAD "RL"
;
; Run:
;   RUN

    B_PRINT: equ 0x9e ; basic token for PRINT
    B_END: equ 0x80 ; basic token for END

; load address
	OFFSET:	equ 0x0401

    dw  END - START

    org OFFSET

START:
    dw  L20, 10  ; next line pointer, current line number
    db  B_PRINT
    dm  ":"
    db  B_PRINT
	dm	"\"-----------------------------\":", B_PRINT
    db  0 ; end of line
L20:
    dw  L30, 20
    db  B_PRINT
    dm  "\"RETROLOAD.COM\":", B_PRINT
    db  0
L30:
    dw  L40, 30
    db  B_PRINT
    db  "\"EXAMPLE FOR KC 85/4  (BASIC)\":", B_PRINT
    db  0
L40:
    dw  L50, 40
    db  B_PRINT
    dm  "\"LOADED AND EXECUTED!\":", B_PRINT
    db  0
L50:
    dw  L60, 50
    db  B_PRINT
    dm  "\"-----------------------------\":", B_PRINT
    db  0
L60:
    dw  L70, 60
    db  B_END
    db  0
L70:
    db  0x00, 0x00

END:

    db  0x03 ; end of text

	end
