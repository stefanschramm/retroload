include ../Makefile.inc

all: rl.z80

%.z80: %.asm
	$(Z80_ASM) "$<" -o "$@"

%.wav: %.z80
	retroload -o $@ $<

clean:
	rm -f *.wav *.z80
