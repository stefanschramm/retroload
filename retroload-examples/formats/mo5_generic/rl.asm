; retroload.com
; example program for Thomson MO5 (BASIC)
; to be assembled using xa
;
; Load:
;   LOAD
;
; Run:
;   RUN
;
; Load and run:
;   LOAD"",R

    B_PRINT = $ab ; basic token for PRINT

; load address
	OFFSET = $25a1

    * = OFFSET

; not sure what this is for
    .asc    $ff
    .asc    $00, $00 ; might be the length, but machine doesnt care

L10:
    .asc    >L20, <L20 ; pointer to next line
    .asc    $00, 10 ; line number
    .asc    B_PRINT
    .asc    ':'
    .asc    B_PRINT
    .asc    '"-------------------------------":'
    .asc    B_PRINT
    .asc    $00 ; end of line

L20:
    .asc    >L30, <L30
    .asc    $00, 20
    .asc    B_PRINT
    .asc    '"RETROLOAD.COM":'
    .asc    B_PRINT
    .asc    $00

L30:
    .asc    >L40, <L40
    .asc    $00, 30
    .asc    B_PRINT
    .asc    '"EXAMPLE FOR THOMSON MO5 (BASIC)":'
    .asc    B_PRINT
    .asc    $00

L40:
    .asc    >L50, <L50
    .asc    $00, 40
    .asc    B_PRINT
    .asc    '"LOADED AND EXECUTED!":'
    .asc    B_PRINT
    .asc    $00

L50:
    .asc    >END, <END
    .asc    $00, 50
    .asc    B_PRINT
    .asc    '"-------------------------------":'
    .asc    B_PRINT
    .asc    $ff, $8f ; CHR$
    .asc    '(7)'
    .asc    $00

END:
    .asc    $00, $00
