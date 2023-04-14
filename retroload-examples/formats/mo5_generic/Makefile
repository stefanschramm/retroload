include ../Makefile.inc

all: rl.bas

%.bas: %.asm
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.bas *.wav
