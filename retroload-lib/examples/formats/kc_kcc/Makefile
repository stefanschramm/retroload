include ../Makefile.inc

all: rl.kcc

%.wav: %.kcc
	retroload -o $@ $<

%.kcc: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.kcc *.wav

