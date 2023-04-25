include ../Makefile.inc

all: rl.bas rl.uef

%.uef: rl.uef.asm %.bas
	$(Z80_ASM) $< -o $@

%.bas: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.bas
