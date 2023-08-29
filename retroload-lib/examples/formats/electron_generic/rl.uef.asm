
    db  "UEF File!", 0x00
    db  0x05 ; version minor
    db  0x00 ; version major

    dw  0x0000 ; origin information chunk
    dw  14, 0x0000 ; uef chunk length
    db  "RetroLoad.com", 0x00

    dw  0x0110 ; carrier tone chunk (beginning)
    dw  2, 0x0000 ; uef chunk length
    dw  0x0e10 ; carrier tone oscillations

    dw  0x0100 ; implicit start/stop bit tape data block
    dw  UEF_CHUNK_END - UEF_CHUNK_BEGIN, 0x0000 ; uef chunk length

UEF_CHUNK_BEGIN:

    db  0x2a ; sync byte

    ; block header
    db  "RL", 0x00 ; file name
    dw  0x0e00, 0xffff ; load address
    dw  0x801f, 0xffff ; entry address
    dw  0 ; block number
    dw  DATA_END - DATA_BEGIN ; data length
    db  0x80 ; is last block
    dw  0xffff, 0xffff ; address of next file?
    dw  0x5bd5 ; precalculated checksum

DATA_BEGIN:

    incbin "rl.bas"

DATA_END:

    dw 0x819e ; precalculated checksum

UEF_CHUNK_END:

    dw  0x0110 ; carrier tone chunk (end)
    dw  2, 0x0000 ; uef chunk length
    dw  0x0e10 ; carrier tone oscillations
