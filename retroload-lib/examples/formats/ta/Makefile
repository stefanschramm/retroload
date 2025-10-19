include ../Makefile.inc

all: rl.bas

%.bas: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.bas *.wav
