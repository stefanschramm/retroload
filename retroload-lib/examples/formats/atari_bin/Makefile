include ../Makefile.inc

all: rl.bin rl.cas

# https://atari800.github.io/
run: rl.cas
	atari800 rl.cas

%.wav: %.cas
	retroload $< -o $@

# https://a8cas.sourceforge.net/
%.cas: %.bin
	a8cas-convert -f c -r $< $@

%.bin: %.asm
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.wav *.cas *.bin
