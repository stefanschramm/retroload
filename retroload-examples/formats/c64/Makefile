include ../Makefile.inc

all: rl.tap rl.prg rl.bin rl.p00 rl.t64

# Emulator:
# https://vice-emu.sourceforge.io/

emutapvic: rl.tap
	xvic -autoload $<

emutapc64: rl.tap
	x64 -autoload $<

emuprgvic: rl.prg
	xvic  $<

emuprgc64: rl.prg
	x64 -autoload $<

%.tap.wav: %.tap
	retroload -o $@ $<

%.prg.wav: %.prg
	retroload -o $@ $<

# https://www.luigidifraia.com/software/#PRG_to_TAP_encapsulation_utility
# https://www.luigidifraia.com/hosted/software/prg2tap-1.8-linux-x86_64-with-examples.tar.gz
%.tap: %.prg
	prg2tap $< $@

%.p00: %.asm
	$(65XX_ASM) -DMAKE_P00=1 $< -o $@

%.prg: %.asm
	$(65XX_ASM) -DMAKE_PRG=1 $< -o $@

%.t64: %.asm
	$(65XX_ASM) -DMAKE_T64=1 $< -o $@

%.bin: %.asm
	$(65XX_ASM) $< -o $@

clean:
	rm -f *.prg *.tap *.wav *.bin

