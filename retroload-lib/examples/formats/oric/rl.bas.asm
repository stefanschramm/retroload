; retroload.com
; example program for Oric-1 (BASIC)
; to be built using xa
;
; Load (and run if autostart is enabled):
;   CLOAD""
;
; Run:
;   RUN

#ifdef MAKE_TAP
  ; header for tape file
  .asc $16, $16, $16 ; sync bytes
  .asc $24 ; end of sync marker
  .byte $0 ; unused
  .byte $0 ; unused
  .byte $00 ; type: BASIC
  .byte $80 ; autostart: yes
  ; Note - Adresses are hardcoded here because xa can not output them in big-endian.
  ; The end address must be adjusted when the file is being modified.
  ; end address
  .byte $05
  .byte $bd
  ; load address
  .byte $05
  .byte $01
  .byte $0 ; unused
  .asc "RL", $0 ; name
#endif

; token
; https://www.defence-force.org/computing/oric/coding/annexe_1/index.htm
PRINT = $ba

* = $0501

L10:
  .dw L20 ; pointer to begin of next statement
  .dw 10 ; line 10
  .asc PRINT, $20, $22, "--------------------------", $22, 0
L20:
  .dw L30
  .dw 20
  .asc PRINT, 0
L30:
  .dw L40
  .dw 30
  .asc PRINT, $20, $22, "RETROLOAD.COM", $22, $0
L40:
  .dw L50
  .dw 40
  .asc PRINT, 0
L50:
  .dw L60
  .dw 50
  .asc PRINT, $20, $22, "EXAMPLE FOR ORIC-1 (BASIC)", $22, 0
L60:
  .dw L70
  .dw 60
  .asc PRINT, 0
L70:
  .dw L80
  .dw 70
  .asc PRINT, $20, $22, "LOADED AND EXECUTED!", $22, 0
L80:
  .dw L90
  .dw 80
  .asc PRINT, 0
L90:
  .dw L100
  .dw 90
  .asc PRINT, $20, $22, "--------------------------", $22, 0
L100:
  .dw END
  .dw 100
  .asc PRINT, 0
END:
  .dw $0000 ; end of program
  .db 0
