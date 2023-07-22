all: rl.fiad

# rl.tifile has been generated using https://github.com/weetmuts/ti994a_basic
# and truncated manually to obtain rl.bin

rl.fiad: fiad_header.bin rl.bin
	dd if=fiad_header.bin of=$@ # 128 bytes header header
	dd if=/dev/zero of=$@ conv=notrunc bs=1 count=256 seek=128 # pad to full 256 byte blocks
	dd if=rl.bin of=$@ conv=notrunc bs=1 seek=128

clean:
	rm -f *.fiad

