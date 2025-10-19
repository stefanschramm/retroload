include ../Makefile.inc

all: rl.com.tap rl.com

%.com.tap: %.com
	./utils/kc851com2tap.py --recordname RL --outputfilename "$@" "$<"

%.com: %.asm
	$(Z80_ASM) "$<" -o "$@"

clean:
	rm -f *.com *.tap *.wav
