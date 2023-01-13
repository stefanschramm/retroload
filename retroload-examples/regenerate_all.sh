#!/bin/sh

for FORMAT in formats/* ; do
  make -C "${FORMAT}" clean all
done
