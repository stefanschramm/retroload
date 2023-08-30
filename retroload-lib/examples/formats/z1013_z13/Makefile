include ../Makefile.inc

all: rl.z13

%.z13: %.asm
	$(Z80_ASM) "$<" -o "$@"

%.wav: %.z13
	retroload -o $@ $<

clean:
	rm -f *.wav *.z13
