all: rl.z13

%.z13: %.asm
	z80asm "$<" -o "$@"

%.wav: %.z13
	retroload -o $@ $<

clean:
	rm -f *.wav *.z13
