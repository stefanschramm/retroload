include ../Makefile.inc

all: rl.bin

%.wav: %.bin
	retroload --lc80name ffff --lc80start 2000 -o $@ $<

%.bin: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.bin *.wav
