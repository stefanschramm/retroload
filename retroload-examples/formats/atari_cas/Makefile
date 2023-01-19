all: rl.cas

# https://atari800.github.io/
run: rl.cas
	atari800 rl.cas

%.wav: %.cas
	retroload $< -o $@

# https://a8cas.sourceforge.net/
%.cas: %.img
	a8cas-convert -f c -r $< $@

%.img: %.asm
	xa $< -o $@

clean:
	rm -f *.wav *.cas *.img
