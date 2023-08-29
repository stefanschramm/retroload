include ../Makefile.inc

all: rl.bin

%.bin: %.asm
	$(6809_ASM) $< -o $@

clean:
	rm -f *.bin *.wav
