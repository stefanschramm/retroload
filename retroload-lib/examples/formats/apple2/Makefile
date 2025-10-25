include ../Makefile.inc

all: rl.bin

run-bin: rl.bin.wav
	mame apple2 -cass $< -ui_active

run-bas: rl.bas.wav
	mame apple2 -cass $< -ui_active

%.bin.wav: %.bin
	retroload -f apple2generic $< -o $@ --shortpilot

%.bas.wav: %.bas
	retroload -f apple2generic $< -o $@ --shortpilot --apple2integerbasic

%.bin: %.bin.asm
	$(65XX_ASM) $< -o $@
	@ SIZE=$$(stat rl.bin --format %s) ; \
	ENDADDR=$$(echo "2048 + $$SIZE - 1" | bc) ; \
	printf "Load command: %X.%XR\n" "2048" "$$ENDADDR"

clean:
	rm -f *.wav *.bin

