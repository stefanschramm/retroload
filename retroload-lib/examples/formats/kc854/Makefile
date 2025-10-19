include ../Makefile.inc

all: rl.kcc rl.sss

%.kcc: %.kcc.asm
	$(Z80_ASM) $< -o $@

%.sss: %.sss.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.kcc *.sss *.wav

