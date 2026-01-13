include ../Makefile.inc

all: rl.bin

run: rl.bin.wav
	mame coco -ui_active -cass rl.bin.wav

%.bin.wav: %.bin
	retroload $< -o $@ --format trs80cocogeneric --name RL --load 0x3f00 --entry 0x3f00 --trs80cocotype 2

%.bin: %.bin.asm
	$(6809_ASM) $< -o $@

clean:
	rm -f *.wav *.bin
