include ../Makefile.inc

all: rl.sss

%.wav: %.sss
	retroload -o $@ $<

%.sss: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.sss *.wav

