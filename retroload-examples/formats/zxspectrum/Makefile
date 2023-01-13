all: rl.bas.tap rl.bin.tap rl.bas.tzx rl.bin.tzx

# https://github.com/weiju/zxtaputils
%.tzx: %.tap
	tzxmerge -o $@ $<

# https://github.com/weiju/zxtaputils
%.bas.tap: %.bas
	bas2tap $< $@

# https://github.com/weiju/zxtaputils
%.bin.tap: %.bin
	tapify --objtype code --filename RL --startaddr 32768 $< $@

%.bin: %.asm
	z80asm $< -o $@

%.tap.wav: %.tap
	retroload -f zxspectrumtap -o $@ $<

%.tzx.wav: %.tzx
	retroload -o $@ $<

clean:
	rm -f *.wav *.tap *.tzx *.bin
