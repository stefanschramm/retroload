include ../Makefile.inc

all: rl.sss

%.sss: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.sss *.wav

