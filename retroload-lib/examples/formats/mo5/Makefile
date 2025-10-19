include ../Makefile.inc

all: rl.bas rl.bas.k7 rl.bin

%.bas: %.bas.asm
	$(6809_ASM) $< -o $@

%.bin: %.bin.asm
	$(6809_ASM) $< -o $@

rl.bas.k7: rl.bas.k7.asm rl.bas
	$(6809_ASM) $< -o $@

clean:
	rm -f *.bas *.k7 *.wav *.bin
