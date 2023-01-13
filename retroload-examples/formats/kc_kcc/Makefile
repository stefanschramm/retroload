all: rl.kcc

%.wav: %.kcc
	retroload -o $@ $<

%.kcc: %.asm
	z80asm $< -o $@

clean:
	rm -f *.kcc *.wav

