; retroload.com
; example program for TRS-80 Color Computer
; to be assembled using asm6809
;
; Load:
;   CLOADM
;
; Run:
;   EXEC &H3F00

START
  leax GREETING, PCR
  bsr PRINTSTRING
  rts

PRINTSTRING
  lda ,x+
  beq PRINTSTRING_END
  jsr [$a002] ; CHROUT
  bra PRINTSTRING
PRINTSTRING_END
  rts

GREETING

  fcc  "\r\n"
  fcc  "-------------------------------\r\n"
  fcc  "\r\n"
  fcc  "RETROLOAD.COM\r\n"
  fcc  "\r\n"
  fcc  "EXAMPLE FOR TRS-80 COCO (ASM)\r\n"
  fcc  "\r\n"
  fcc  "LOADED AND EXECUTED!\r\n"
  fcc  "\r\n"
  fcc  "-------------------------------\r\n"
  fcc  "\r\n"
  fcc  0

END

