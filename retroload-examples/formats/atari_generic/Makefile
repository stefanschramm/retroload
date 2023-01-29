# example for Atari 800 XL using entered basic program
# Load:
# ENTER "C:"

include ../Makefile.inc

all: rl.atascii

%.wav: %.atascii
	retroload --format generic --machine atari $< -o $@

# \233 is 0x9b which are line endings in ATASCII
%.atascii: %.txt
	tr '\n' "\233" < $< > $@

clean:
	rm -f *.wav *.atascii
