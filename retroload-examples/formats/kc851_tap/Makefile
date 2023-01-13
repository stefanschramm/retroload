all: rl.tap

%.wav: %.tap
	retroload -o $@ $<

%.tap: %.com
	./utils/kc851com2tap.py --recordname RL --outputfilename "$@" "$<"

%.com: %.asm
	z80asm "$<" -o "$@"

clean:
	rm -f *.com *.tap *.wav
