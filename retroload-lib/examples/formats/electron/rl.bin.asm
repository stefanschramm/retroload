; retroload.com
; example program for Acorn Electron (Assembler)
; to be assembled using xa
;
; Load and run:
;   *RUN
;
; Load:
;   *LOAD "" 1000
;
; Run:
;   CALL &1000

; OSASCI ROM routine expects the character to print in register A
OSASCI = $ffe3

OFFSET = $1000

; temporary location somewhere in zero page
TMP_STRING_PTR = $00da ; and next byte

  * = OFFSET

  ldx  #<GREETING
  ldy  #>GREETING
  jsr  WRITE_STRING

; we don't return to BASIC because its memory is messed up now
LOOP:
  jmp  LOOP

WRITE_STRING:
  ; x y address (high low)
  stx  TMP_STRING_PTR
  sty  TMP_STRING_PTR + 1
  ldy  #0
WRITE_STRING_NEXT_CHAR:
  lda  (TMP_STRING_PTR), Y
  beq  WRITE_STRING_END
  jsr  OSASCI
  iny
  bne  WRITE_STRING_NEXT_CHAR
  ; overflow - increment high byte of string pointer
  inc  TMP_STRING_PTR + 1
  jmp  WRITE_STRING_NEXT_CHAR
WRITE_STRING_END:
  rts

GREETING:
  .asc  $0d
  .asc  "----------------------------", $0d
  .asc  $0d
  .asc  "RETROLOAD.COM", $0d
  .asc  $0d
  .asc  "EXAMPLE FOR ACORN ELECTRON", $0d
  .asc  $0d
  .asc  "LOADED AND EXECUTED!", $0d
  .asc  $0d
  .asc  "----------------------------", $0d
  .asc  $0d
  .asc  "Press CTRL+BREAK for reset."
  .asc  $07 ; bell
  .asc  $0d, $00

END:
