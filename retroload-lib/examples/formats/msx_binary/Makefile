include ../Makefile.inc

all: rl.cas rl.bin

# https://openmsx.org/
run: rl.cas
	openmsx -machine "Philips_VG_8020-20" rl.cas

%.cas: %.cas.asm %.bin
	$(Z80_ASM) $< -o $@

%.bin: %.bin.asm
	$(Z80_ASM) $< -o $@

%.wav: %.cas
	retroload --shortpilot --msxfast -o $@ $<

clean:
	rm -f *.wav *.cas
