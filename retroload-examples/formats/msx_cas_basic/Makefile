include ../Makefile.inc

all: rl.cas

# https://openmsx.org/
run: rl.cas
	openmsx -machine "Philips_VG_8020-20" rl.cas

rl.cas: rl.asm rl.bas
	$(Z80_ASM) $< -o $@

# https://github.com/farique1/MSX-Basic-Tokenizer
%.bas: %.txt
	msxbatoken.py -vb 0 $< /dev/stdout | tail -c +2 > $@

%.wav: %.cas
	retroload --shortpilot --msxfast -o $@ $<

clean:
	rm -f *.wav *.cas *.bas
