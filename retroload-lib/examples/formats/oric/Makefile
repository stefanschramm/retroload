include ../Makefile.inc

all: rl.bin

play: rl.bin
	retroload -l 4 --shortpilot --format oricgeneric --name RL --load 1000 --oricautostart $<

%.bin.tap.wav: %.bin.tap
	retroload -l 4 --shortpilot -o $@ $<

%.bin.wav: %.bin
	retroload -l 4 --shortpilot --format oricgeneric --name RL --load 1000 --oricautostart -o $@ $<

%.bin.tap: %.asm
	$(65XX_ASM) -DMAKE_TAP=1 $< -o $@

%.bin: %.asm
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.prg *.tap *.wav *.bin *.t64
