all: rl.cdt

# https://www.cpcwiki.eu/forum/applications/2cdt/
# https://github.com/lronaldo/cpctelera/tree/master/cpctelera/tools/2cdt
%.cdt: %.bin
	2cdt -n -s 0 -t 1 -m 0 -X 2000 -L 2000 -F 2 -r RL $< $@

%.bin: %.asm
	z80asm $< -o $@

clean:
	rm -f *.wav *.bin *.cdt
