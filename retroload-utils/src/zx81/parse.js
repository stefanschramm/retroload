import {BufferAccess} from 'retroload-common';
import * as fs from 'fs';

const memOffset = 16393;

/**
 * http://fileformats.archiveteam.org/wiki/Sinclair_BASIC_tokenized_file
 */
const fieldTable = `
16393	1	VERSN	0 Identifies ZX81 BASIC in saved programs.
16394	2	E_PPC	Number of current line (with program cursor).
16396	2	D_FILE	Pointer to the start of the 'Display file', i.e. what is being displayed on screen
16398	2	DF_CC	Address of PRINT position in display file. Can be poked so that PRINT output is sent elsewhere.
16400	2	VARS	Pointer to start of BASIC Variable table
16402	2	DEST	Address of variable in assignment.
16404	2	E_LINE	Pointer to line currently being entered
16406	2	CH_ADD	Address of the next character to be interpreted: the character after the argument of PEEK, or the NEWLINE at the end of a POKE statement.
16408	2	X_PTR	Address of the character preceding the marker.
16410	2	STKBOT	pointer to start (bottom) of stack
16412	2	STKEND	pointer to end (top) of stack
16414	1	BERG	Calculator's b register.
16415	2	MEM	Address of area used for calculator's memory. (Usually MEMBOT, but not always.)
16417	1	-	not used
16418	1	DF_SZ	The number of lines (including one blank line) in the lower part of the screen.
16419	2	S_TOP	The number of the top program line in automatic listings.
16421	2	LAST_K	Shows which keys pressed.
16423	1	-	Debounce status of keyboard.
16424	1	MARGIN	Number of blank lines above or below picture: 55 in Britain, 31 in America.
16425	2	NXTLIN	Address of next program line to be executed.
16427	2	OLDPPC	Line number of which CONT jumps.
16429	1	FLAGX	Various flags.
16430	2	STRLEN	Length of string type destination in assignment.
16432	2	T_ADDR	Address of next item in syntax table (very unlikely to be useful).
16434	2	SEED	The seed for RND. This is the variable that is set by RAND.
16436	2	FRAMES	Counts the frames displayed on the television. Bit 15 is 1. Bits 0 to 14 are decremented for each frame set to the television. This can be used for timing, but PAUSE also uses it. PAUSE resets to 0 bit 15, & puts in bits 0 to 14 the length of the pause. When these have been counted down to zero, the pause stops. If the pause stops because of a key depression, bit 15 is set to 1 again.
16438	1	COORDS	x-coordinate of last point PLOTted.
16439	1	-	y-coordinate of last point PLOTted.
16440	1	PR_CC	Less significant byte of address of next position for LPRINT to print as (in PRBUFF).
16441	1	S_POSN	Column number for PRINT position.
16442	1	-	Line number for PRINT position.
16443	1	CDFLAG	Various flags. Bit 7 is on (1) during compute & display mode.
16444	33	PRBUFF	Printer buffer (33rd character is NEWLINE).
16477	30	MEMBOT	Calculator's memory area; used to store numbers that cannot conveniently be put on the calculator stack.
16507	2	-	not used
16509	1	-	First BASIC line.
`.trim();

function main() {
    const data = fs.readFileSync(process.argv[2]);
    const arrayBuffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength,
    );
    const ba = new BufferAccess(arrayBuffer);

    console.log('Dump as in memory:');
    const fullDump = BufferAccess.create(ba.length() + memOffset);
    fullDump.setBa(memOffset, ba);
    console.log(fullDump.asHexDump());

    console.log('address\t(faddr)\tname\tvalue\tdescription\n-------\t-------\t-------\t-----------------------------------------');
    for (const f of getFieldData()) {
        const fileAddr = f.address - memOffset;
        switch (f.bytes) {
            case 1:
                dumpNumericValue(f, ba.getUint8(fileAddr));
                break;
            case 2:
                dumpNumericValue(f, ba.getUint16LE(fileAddr));
                break;
            default:
                dumpHex(f, ba.slice(fileAddr, f.bytes));
                break;
        }
    }

}

function dumpNumericValue(f, value) {
    console.log(`${f.address}\t${fHex(f.address - memOffset, 2)}\t${f.name}\t${value}\t${f.description}`);
    // console.log(`${fHex(f.address, 2)}\t${fHex(f.address - memOffset, 2)}\t${f.name}\t${fHex(value, f.bytes)}\t${f.description}`);
}

function dumpHex(f, ba) {
    console.log(`${fHex(f.address, 2)}\t${fHex(f.address - memOffset, 2)}\t${f.name}\t-\t${f.description}\n${ba.asHexDump()}`);
}

function getFieldData() {
    return fieldTable
        .split('\n')
        .map(f => f.split('\t'))
        .map(f => ({
            address: parseInt(f[0]),
            bytes: parseInt(f[1]),
            name: f[2],
            description: f[3],
        }))
    ;
}

function fHex(value, bytes) {
    return `0x${value.toString(16).padStart(2 * bytes, '0')}`;
}

main();