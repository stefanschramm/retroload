include ../Makefile.inc

all: rl.bas.cas rl.bin.cas rl.txt.cas rl.bas rl.bin

# https://openmsx.org/
EMULATOR=openmsx -machine Philips_VG_8020-20

run-bas: rl.bas.cas
	$(EMULATOR) rl.bas.cas

run-bin: rl.bin.cas
	$(EMULATOR) rl.bin.cas

run-txt: rl.txt.cas
	$(EMULATOR) rl.txt.cas

rl.bas.cas: rl.bas.cas.asm rl.bas
	$(Z80_ASM) $< -o $@

rl.bin.cas: rl.bin.cas.asm rl.bin
	$(Z80_ASM) $< -o $@

rl.txt.cas: rl.txt.cas.asm rl.txt
	$(Z80_ASM) $< -o $@

# https://github.com/farique1/MSX-Basic-Tokenizer
%.bas: %.bas.txt
	msxbatoken.py -vb 0 $< /dev/stdout | tail -c +2 > $@

%.bin: %.bin.asm
	$(Z80_ASM) $< -o $@

clean:
	rm -f *.wav *.cas *.bas *.bin
