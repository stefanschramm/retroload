include ../Makefile.inc

all: rl.a

run-ascii: rl.a.wav
	mame ibm5150 -cass $< -natural -ui_active -window -skip_gameinfo

run-basic: rl.b.wav
	mame ibm5150 -cass $< -natural -ui_active -window -skip_gameinfo

%.a.wav: %.a
	retroload --name rl -l 4 -f ibm5150basic $< -o $@

# Example rl.b was created by making a recording using MAME and decoding it using retroload-decode.
%.b.wav: %.b
	retroload --name rl -l 4 -f ibm5150basic --ibm5150basictype 128 $< -o $@

# ASCII BASIC listings use only \r for linebreaks, no \n
%.a: %.txt
	cat "$<" | tr -d '\n' > "$@"

clean:
	rm -f *.a *.wav

