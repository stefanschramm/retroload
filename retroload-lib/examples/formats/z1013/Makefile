include ../Makefile.inc

all: rl.z13 rl.z80

%.z80: %.z80.asm %.z13
	$(Z80_ASM) "$<" -o "$@"

%.z13: %.z13.asm
	$(Z80_ASM) "$<" -o "$@"

%.wav: %.z13
	retroload -o $@ $<

clean:
	rm -f *.wav *.z13 *.z80
