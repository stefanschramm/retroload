include ../Makefile.inc

all: rl.bin rl.bin.tap rl.bas.tap

play: rl.bin
	retroload -l 4 --shortpilot --format oricgeneric --name RL --load 1000 --oricautostart $<

%.bas.tap: %.bas.asm
	$(65XX_ASM) -DMAKE_TAP=1 $< -o $@

%.bin.tap: %.bin.asm
	$(65XX_ASM) -DMAKE_TAP=1 $< -o $@

%.bin: %.bin.asm
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.prg *.tap *.wav *.bin *.t64
