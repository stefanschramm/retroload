include ../Makefile.inc

all: rl.bin

play: rl.bin
	retroload -l 4 --shortpilot --format oricgeneric --name RL --load 1000 --oricautostart $<

%.bas.tap: %.bas.asm
	$(65XX_ASM) -DMAKE_TAP=1 $< -o $@

%.bin.tap: %.asm
	$(65XX_ASM) -DMAKE_TAP=1 $< -o $@

%.bin: %.asm
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.prg *.tap *.wav *.bin *.t64
