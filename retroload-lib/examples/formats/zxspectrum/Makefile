include ../Makefile.inc

all: rl.bas.tap rl.bin.tap rl.bas.tzx rl.bin.tzx rl.bas rl.bin

# https://github.com/weiju/zxtaputils
%.tzx: %.tap
	tzxmerge -o $@ $<

# https://github.com/weiju/zxtaputils
%.bas.tap: %.txt
	bas2tap $< $@

# https://github.com/weiju/zxtaputils
%.bas: %.txt
	bas2tap --format plain $< $@

# https://github.com/weiju/zxtaputils
%.bin.tap: %.bin
	tapify --objtype code --filename RL --startaddr 32768 $< $@

%.bin: %.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.wav *.tap *.tzx *.bin *.bas
