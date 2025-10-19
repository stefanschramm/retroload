include ../Makefile.inc

all: rl.kcc

%.kcc: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.kcc *.wav

