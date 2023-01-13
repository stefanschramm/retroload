all: rl.z80

%.z80: %.asm
	z80asm "$<" -o "$@"

%.wav: %.z80
	retroload -o $@ $<

clean:
	rm -f *.wav *.z80
