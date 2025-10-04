include ../Makefile.inc

all: rl.bin

play: rl.bin
	retroload -l 4 --shortpilot --format oricgeneric --name RL --load 1000 --oricautostart $<

%.bin.wav: %.bin
	retroload -l 4 --shortpilot --format oricgeneric --name RL --load 1000 --oricautostart -o $@ $<

%.bin: %.asm
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.prg *.tap *.wav *.bin *.t64
