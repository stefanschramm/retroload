include ../Makefile.inc

all: rl.bas.p

# https://sourceforge.net/p/emuscriptoria/code/HEAD/tree/desprot/ZMakeBas.c
%.bas.p: %.txt
	ZMakeBas -p -o $@ $<

clean:
	rm -f *.p *.wav
