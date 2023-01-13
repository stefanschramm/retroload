all: rl.bin

%.wav: %.bin
	retroload --lc80name ffff --lc80start 2000 -o $@ $<

%.bin: %.asm
	z80asm $< -o $@

clean:
	rm -f *.bin *.wav
