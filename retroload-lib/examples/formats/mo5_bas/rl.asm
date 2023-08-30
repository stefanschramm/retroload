; retroload.com
; example program for Thomson MO5 (BASIC)
; to be assembled using asm6809
;
; Load:
;   LOAD
;
; Run:
;   RUN
;
; Load and run:
;   LOAD"",R

B_PRINT equ $ab ; basic token for PRINT
B_CHR equ $ff8f ; basic token for CHR$

LOAD_ADDRESS  equ $25a1

	ORG LOAD_ADDRESS
  PUT 0

BEGIN

; http://dcmoto.free.fr/forum/messages/591147_0.html
    fcb    $ff ; unprotected file
    fdb    END-BEGIN ; length

L10
    fdb    L20 ; pointer to next line
    fdb    10 ; line number
    fcb    B_PRINT
    fcc    ':'
    fcb    B_PRINT
    fcc    "\"-------------------------------\":"
    fcb    B_PRINT
    fcb    0 ; end of line

L20
    fdb    L30
    fdb    20
    fcb    B_PRINT
    fcc    "\"RETROLOAD.COM\":"
    fcb    B_PRINT
    fcb    0

L30
    fdb    L40
    fdb    30
    fcb    B_PRINT
    fcc    "\"EXAMPLE FOR THOMSON MO5 (BASIC)\":"
    fcb    B_PRINT
    fcb    0

L40
    fdb    L50
    fdb    40
    fcb    B_PRINT
    fcc    "\"LOADED AND EXECUTED!\":"
    fcb    B_PRINT
    fcb    0

L50
    fdb    LAST_LINE
    fdb    50
    fcb    B_PRINT
    fcc    "\"-------------------------------\":"
    fcb    B_PRINT
    fdb    B_CHR
    fcc    "(7)"
    fcb    0

LAST_LINE
    fdb    $0000

END
