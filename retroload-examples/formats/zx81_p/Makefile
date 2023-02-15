include ../Makefile.inc

all: rl.p

# https://sourceforge.net/p/emuscriptoria/code/HEAD/tree/desprot/ZMakeBas.c
%.p: %.bas
	ZMakeBas -p -o $@ $<

clean:
	rm -f *.p
