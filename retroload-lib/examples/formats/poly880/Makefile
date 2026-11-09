include ../Makefile.inc

all: rl.bin

%.bin: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.bin *.wav
