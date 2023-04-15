include ../Makefile.inc

all: rl.bas rl.k7

%.bas: %.asm
	$(65XX_ASM) $< -o $@

rl.k7: rl.k7.asm rl.bas
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.bas *.wav
