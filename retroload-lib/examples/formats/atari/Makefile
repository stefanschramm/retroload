include ../Makefile.inc

all: rl.bin.cas rl.atascii

EMULATOR=atari800

# https://atari800.github.io/
run-bin: rl.bin.cas
	$(EMULATOR) rl.bin.cas

# https://a8cas.sourceforge.net/
%.bin.cas: %.bin
	a8cas-convert -f c -r $< $@

%.bin: %.asm
	$(65XX_ASM) $< -o $@

# \233 is 0x9b which are line endings in ATASCII
%.atascii: %.txt
	tr '\n' "\233" < $< > $@

clean:
	rm -f *.wav *.cas *.bin *.atascii
