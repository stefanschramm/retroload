include ../Makefile.inc

all: rl.bas

%.wav: %.bas
	retroload -o $@ $<

%.bas: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.bas *.wav
