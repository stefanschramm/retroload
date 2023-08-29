include ../Makefile.inc

all: rl.cdt rl.bin

# https://www.cpcwiki.eu/forum/applications/2cdt/
# https://github.com/lronaldo/cpctelera/tree/master/cpctelera/tools/2cdt
%.cdt: %.bin
	2cdt -n -s 0 -t 0 -m 0 -X 8192 -L 8192 -F 2 -r RL $< $@

%.bin: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.wav *.bin *.cdt
