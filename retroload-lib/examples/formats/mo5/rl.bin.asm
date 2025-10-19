; retroload.com
; example program for Thomson MO5 (Assembly)
; to be assembled using asm6809
;
; Load:
;   LOADM
;
; Run:
;   EXEC &H2700
;
; Load and run:
;   LOADM"",,R


; Binary (non-BASIC) file structure documentation:
; http://dcmoto.free.fr/forum/messages/591147_0.html

LOAD_ADDRESS  equ $2700

; block header for program data

  fcb  $00
  fdb  END-START ; length
  fdb  LOAD_ADDRESS ; load address

; actual program data
; (we don't need ORG here because all references are relative)

START
  leax GREETING, PCR
  bsr PRINTSTRING
  rts

PRINTSTRING
  ldb 0,x!
  beq PRINTSTRING_END
  swi
  fcb $02 ; PUTCH monitor call
  ldb #1
  abx
  bra PRINTSTRING
PRINTSTRING_END
  rts

GREETING

  fcc  "\r\n"
  fcc  "-------------------------------\r\n"
  fcc  "\r\n"
  fcc  "RETROLOAD.COM\r\n"
  fcc  "\r\n"
  fcc  "EXAMPLE FOR THOMSON MO5 (ASM)\r\n"
  fcc  "\r\n"
  fcc  "LOADED AND EXECUTED!\r\n"
  fcc  "\r\n"
  fcc  "-------------------------------\r\n"
  fcc  "\r\n"
  fcc  7 ; bell 
  fcc  0

END

; block for specifying entry address

  fcb  $ff
  fdb  $0000
  fdb  LOAD_ADDRESS
