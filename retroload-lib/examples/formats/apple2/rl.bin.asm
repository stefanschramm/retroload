; retroload.com
; example program for Apple II (Assembler)
; to be assembled using xa
;
; Load:
; 800.89AR
;
; Run:
; 800G

COUT = $fded

; temporary location somewhere in zero page
TMP_STRING_PTR = $003c ; and next byte

  * = $0800

  ldx #<GREETING
  ldy #>GREETING
  jsr WRITE_STRING
  rts

WRITE_STRING:
  ; x y address (high low)
  stx TMP_STRING_PTR
  sty TMP_STRING_PTR + 1
  ldy #0
WRITE_STRING_NEXT_CHAR:
  lda (TMP_STRING_PTR), Y
  beq WRITE_STRING_END
  ora #$80
  jsr COUT
  iny
  bne WRITE_STRING_NEXT_CHAR
  ; overflow - increment high byte of string pointer
  inc TMP_STRING_PTR + 1
  jmp WRITE_STRING_NEXT_CHAR
WRITE_STRING_END:
  rts

GREETING:
  .asc $0d
  .asc "----------------------------", $0d
  .asc $0d
  .asc "RETROLOAD.COM", $0d
  .asc $0d
  .asc "EXAMPLE FOR APPLE II", $0d
  .asc $0d
  .asc "LOADED AND EXECUTED!", $0d
  .asc $0d
  .asc "----------------------------", $0d
  .asc $07 ; bell
  .asc $00

END:
