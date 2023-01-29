; retroload.com
; example program for C64 and VIC-20
; to be assembled using xa

; CHROUT kernal routine (same for VIC-20 and C64)
; expects character to print in register A
CHROUT	= $ffd2

OFFSET	= $1100 ; start the program using SYS 4352

TMP_STRING_PTR = $0035 ; and next byte

	* = OFFSET

#ifdef MAKE_PRG
	; a .prg file has the offset address as first 2 bytes
	.word	*
	* = OFFSET
#endif

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
