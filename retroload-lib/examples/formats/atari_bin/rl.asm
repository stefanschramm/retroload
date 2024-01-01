; retroload.com
; example program for Atari 800 XL
; to be assembled using xa

OFFSET	= $0600

; locations used by CIO routines

ICCOM	= $0342
ICBAL	= $0344
ICBAH	= $0345
ICBLL	= $0348
ICBLH	= $0349
CIOV	= $e456

PUTCHAR	= $0b

GREETING_LENGTH = GREETING_END - GREETING

	* = OFFSET

; header for bootable tape

	.byt	$00 ; ignored
	.byt	$02 ; number of blocks to load
	.dw	OFFSET ; load address
	.dw	START ; start address

; actual program

START:
	ldx	#0 ; IOCB0
	lda	#PUTCHAR
	sta	ICCOM, X

	; pointer to message
	lda	#>GREETING
	sta	ICBAH, X
	lda	#<GREETING
	sta	ICBAL, X

	lda	#>(GREETING_LENGTH)
	sta	ICBLH, X
	lda	#<(GREETING_LENGTH)
	sta	ICBLL, X

	jsr	CIOV

LOOP:
	jmp	LOOP


GREETING:
	.asc	$9b
	.asc	"------------------------", $9b
	.asc	$9b
	.asc	"RETROLOAD.COM", $9b
	.asc	$9b
	.asc	"EXAMPLE FOR ATARI 800 XL", $9b
	.asc	$9b
	.asc	"LOADED AND EXECUTED!", $9b
	.asc	$9b
	.asc	"------------------------", $9b
	.asc	$9b

GREETING_END:
