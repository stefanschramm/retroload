; start block
  .dsb 16, $01
  .asc $3c, $5a, $00, $10
  .asc "RL      BAS"
  .asc $00, $00, $00, $cc ; precalculated checksum

; data block
  .dsb 16, $01
  .asc $3c, $5a, $01, $be
  .bin 0,0,"rl.bas"
  .asc $52 ; precalculated checksum

; end block
  .dsb 16, $01
  .asc $3c, $5a, $ff, $02, $00
