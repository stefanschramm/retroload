; retroload.com
; example program for Z 1013
; to be assembled using z80asm
;
; see rl.asm for load/run instructions


; Headersave Header
; https://hc-ddr.hucki.net/wiki/doku.php/z1013/software/headersave

; Memory addresses for the header must match with rl.z13.asm.

; load address
	dw	0x1000
; end address
	dw	0x108f
; start address
	dw	0x1000
	ds	6 ; additional information
	db	0x43 ; type
	ds	3, 0xd3 ; header identifier
	dm	"RL              " ; filename

	incbin 'rl.z13'
