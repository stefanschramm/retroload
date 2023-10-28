include ../Makefile.inc

all: rl.bas rl.bin rl.uef

%.uef: rl.uef.asm %.bas
	$(Z80_ASM) $< -o $@

%.bas: %.bas.asm
	$(Z80_ASM) $< -o $@

%.bin: %.bin.asm
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.bas *.uef *. bas *.bin *.wav
