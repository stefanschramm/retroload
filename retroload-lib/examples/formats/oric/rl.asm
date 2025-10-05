; retroload.com
; example program for Oric-1
; to be built using xa
;
; Load:
;   CLOAD""
;
; Run:
;   CALL 4096

; screen is 40 columns x 28 rows
; skip the first row, because it's the status bar
SCREEN_MEMORY = $bb80 + 40
POINTER_SRC = $0002 ; and next byte
POINTER_DST = $0004 ; and next byte

#ifdef MAKE_TAP
  ; header for tape file
  .asc $16, $16, $16 ; sync bytes
  .asc $24 ; end of sync marker
  .byte $0 ; unused
  .byte $0 ; unused
  .byte $80 ; type: binary
  .byte $cf ; autostart: true
  ; Note - Adresses are hardcoded here because xa can not output them in big-endian.
  ; The end address must be adjusted when the file is being modified.
  ; end address
  .byte $11
  .byte $b8
  ; load address
  .byte $10
  .byte $00
  .byte $0 ; unused
  .asc "RL", $0 ; name
#endif

; The Oric-1 ROM does not seem to provide officially documented routines for text output.
; Therefore, we copy our greeting message directly into screen memory at $bb80.

.org $1000

  ldx  #<GREETING
  ldy  #>GREETING
  stx  POINTER_SRC
  sty  POINTER_SRC + 1

  ldx  #<SCREEN_MEMORY
  ldy  #>SCREEN_MEMORY
  stx  POINTER_DST
  sty  POINTER_DST + 1

  ldy #0

NEXT_BYTE:
  lda (POINTER_SRC), Y
  beq DONE
  sta (POINTER_DST), Y
  iny
  bne NEXT_BYTE
  ; overflow of y - increment high byte of pointers
  inc POINTER_SRC + 1
  inc POINTER_DST + 1
  jmp NEXT_BYTE

DONE:
  ; Move cursor below our message to prevent the READY prompt from overwriting it.
  lda #12
  sta $0268 ; cursor row

  rts

GREETING:
  .asc "----------------------                  "
  .asc "                                        "
  .asc "RETROLOAD.COM                           "
  .asc "                                        "
  .asc "EXAMPLE FOR ORIC-1                      "
  .asc "                                        "
  .asc "LOADED AND EXECUTED!                    "
  .asc "                                        "
  .asc "----------------------                  "
  .asc "                                        "
  .byte 0
