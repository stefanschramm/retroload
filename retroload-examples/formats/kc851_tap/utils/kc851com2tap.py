#!/usr/bin/env python

import struct
import os
import argparse

def main():
	parser = argparse.ArgumentParser(description='Convert KC 85/1 COM file to TAP file')
	parser.add_argument('--recordname', required=True, nargs=1, help='Name to be used for tape record (8 chars max, usually uppercase)')
	parser.add_argument('--outputfilename', required=True, nargs=1, help='Path to the TAP file to save')
	# TODO: addresses require parsing
	# parser.add_argument('--loadaddress', help='Memory address where COM file should be loaded')
	# parser.add_argument('--startaddress', help='Memory address of program entry')
	parser.add_argument('inputfilename', help='Path to the COM file to convert')
	args = parser.parse_args()


	write_tap(
		args.inputfilename,
		filename_out=args.outputfilename[0],
		record_name=str.encode(args.recordname[0]),
		load_address=0x0300,
		start_address=0x0300,
	)

def write_tap(filename_in, filename_out, record_name, load_address, start_address, block=0):

	infile = open(filename_in, 'rb');
	size = os.stat(filename_in).st_size
	end_address = load_address + size - 1
	filename_out = filename_in + '.tap' if filename_out == None else filename_out

	f = open(filename_out, 'wb')

	# file header
	f.write(b'\xc3KC-TAPE by AF. ')

	# header block
	f.write(struct.pack('b', block))
	block += 1
	f.write(struct.pack('8s', record_name))
	f.write(b'COM') # filetype
	f.write(b'\x00\x00')
	f.write(b'\x00\x00\x00')
	f.write(b'\x03')
	f.write(struct.pack('h', load_address))
	f.write(struct.pack('h', end_address))
	f.write(struct.pack('h', start_address))
	f.write(b'\x00')
	f.write(b'\x00' * (128 - 24)) # padding

	# data blocks
	while True:
		data = infile.read(128);
		if len(data) == 0:
			break
		if 128 * (block - 1) + len(data) == size:
			block = 0xff
		f.write(struct.pack('B', block))
		f.write(struct.pack('128s', data))
		block += 1

	f.close()

	infile.close()


if __name__ == '__main__':
	main()
