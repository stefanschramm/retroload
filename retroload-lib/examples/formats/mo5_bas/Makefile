include ../Makefile.inc

all: rl.bas rl.k7

%.bas: %.asm
	$(6809_ASM) $< -o $@

rl.k7: rl.k7.asm rl.bas
	$(6809_ASM) $< -o $@

clean:
	rm -f *.bas *.k7 *.wav
