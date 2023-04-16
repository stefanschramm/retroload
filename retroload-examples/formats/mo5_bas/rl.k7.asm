; start block
  fill $01, 16
  fcc $3c, $5a, $00, $10
  fcc "RL      BAS"
  fcc $00, $00, $00, $cc ; precalculated checksum

; data block
  fill $01, 16
  fcc $3c, $5a, $01, $be
  includebin "rl.bas"
  fcc $96 ; precalculated checksum (depends on content of rl.bas!)

; end block
  fill $01, 16
  fcc $3c, $5a, $ff, $02, $00
