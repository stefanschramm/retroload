; retroload.com
; example program for LC 80
; to be assembled using z80asm
;
; Load: <LD>FFFF<EX>
; Run: <RES><ADR>2000<EX>


; bit values for 7-segment display
;         ____
;      2 / 4 / 1
;       /___/
;   64 / 8 / 32
;     /___/ . 16
;      128

; trying to map latin letters to the 7-segments

	A:	equ 64 + 2 + 4 + 8 + 1 + 32
	B:	equ 64 + 2 + 128 + 32 + 8
	C:	equ 4 + 2 + 64 + 128
	D:	equ 1 + 32 + 8 + 64 + 128
	E:	equ 2 + 64 + 4 + 8 + 128
	F:	equ 2 + 64 + 4 + 8
	G:	equ 4 + 2 + 64 + 128 + 32 + 8
	H:	equ 8 + 2 + 1 + 64 + 32 ; :/ H/X
	I:	equ 2 + 65
	J:	equ 64 + 128 + 32 + 1
	K:	equ 2 + 64 + 8 + 128 ; :/
	L:	equ 2 + 64 + 128
	M:	equ 64 + 8 + 32 ; :/ M/N
	N:	equ 64 + 8 + 32 ; :/ M/N
	O:	equ 2 + 4 + 1 + 32 + 128 + 64
	P:	equ 2 + 4 + 1 + 8 + 64
	Q:	equ 2 + 4 + 1 + 8 + 32
	R:	equ 64 + 8
	S:	equ 4 + 2 + 8 + 32 + 128
	T:	equ 4 + 1 + 32
	U:	equ 2 + 64 + 128 + 32 + 1
	V:	equ 64 + 128 + 32 ; :/ V/W
	W:	equ 64 + 128 + 32 ; :/ V/W
	X:	equ 8 + 2 + 1 + 64 + 32 ; :/ H/X
	Z:	equ 4 + 1 + 8 + 64 + 128
	DOT:	equ 16
	SPACE:	equ 0
	MINUS:	equ 8

 ; monitor routines
 	DAK2:	equ 0x0883 ; output of 6 bytes (indexed by IX) to 7-segments display
	SOUND:	equ 0x0376 ; frequency in C, length in HL

	org	0x2000

START:
	ld	c, 0x80
	ld	hl, 0x0010
	call	SOUND
	ld	c, 0
	ld	ix, GREETING_END - 6
NEXT:
	ld	d, 0x20
WAIT:
	call	DAK2
	dec	d
	cp	d
	jr	nz, WAIT

	dec	ix
	inc	c
	ld	a, GREETING_END - GREETING - 6 ; = length
	cp	c
	jr	z, START
	jr	NEXT

; text needs to be written in reverse
GREETING:
	dm	SPACE, SPACE, SPACE, SPACE, SPACE, SPACE
	dm	MINUS, MINUS, MINUS
	dm	D, A, O, L, O, R, T, E, R
	dm	MINUS, MINUS, MINUS
	dm	SPACE, SPACE, SPACE, SPACE, SPACE, SPACE
GREETING_END:
