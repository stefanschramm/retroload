include ../Makefile.inc

all: rl.bin rl.mzf

%.mzf: %.mzf.asm %.bin
	$(Z80_ASM) $< -o $@

%.bin: %.bin.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.wav *.bin
