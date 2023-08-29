; retroload.com
; example program for C64 and VIC-20
; to be assembled using xa

; CHROUT kernal routine (same for VIC-20 and C64)
; expects character to print in register A
CHROUT	= $ffd2

OFFSET	= $1100 ; start the program using SYS 4352

TMP_STRING_PTR = $0035 ; and next byte

* = $0000

#ifdef MAKE_P00
	; http://unusedino.de/ec64/technical/formats/pc64.html
	.asc	"C64File", $00
	.asc	"RL", $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
	.asc	$00
	.asc	$00
	.word	OFFSET
#endif

#ifdef MAKE_T64
	; http://unusedino.de/ec64/technical/formats/t64.html
	; tape archive header
	.asc	"C64 tape image file", $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
	.word	$0100 ; version
	.word	1 ; maximum number of entries
	.word	1 ; total number of used entries
	.word	0 ; unused
	.asc	"RL                      " ; tape container name
	; entries
	.byte	1 ; type: normal tape file
	.byte	$82 ; type: prg
	.word	OFFSET ; load address
	.word	OFFSET + END - START ; end address
	.word	0 ; unused
	.word	T64_CONTAINER_START ; offset in container file
	.word	0 ; offset in container file (H)
	.asc	0, 0, 0, 0 ; unused
	.asc	"RL              " ; file name
T64_CONTAINER_START:
#endif

#ifdef MAKE_PRG
	; a .prg file has just the offset address as first 2 bytes
	.word	OFFSET
#endif

	* = OFFSET

START:

; actual program

	ldx	#<GREETING
	ldy	#>GREETING
	jsr	WRITE_STRING

	rts


WRITE_STRING:
	; x y address (high low)
	stx	TMP_STRING_PTR
	sty	TMP_STRING_PTR + 1
	ldy	#0
WRITE_STRING_NEXT_CHAR:
	lda	(TMP_STRING_PTR), Y
	beq	WRITE_STRING_END
	jsr	CHROUT
	iny
	bne	WRITE_STRING_NEXT_CHAR
	; overflow - increment high byte of string pointer
	inc	TMP_STRING_PTR + 1
	jmp	WRITE_STRING_NEXT_CHAR
WRITE_STRING_END:
	rts


GREETING:
	.asc	$0d
	.asc	"----------------------", $0d
	.asc	$0d
	.asc	"RETROLOAD.COM", $0d
	.asc	$0d
	.asc	"EXAMPLE FOR C64 AND", $0d
	.asc	"VIC20", $0d
	.asc	$0d
	.asc	"LOADED AND EXECUTED!", $0d
	.asc	$0d
	.asc	"----------------------", $0d
	.asc	$0d, $00

END:
