#!/bin/sh

FORMATS_DIR="$(dirname $(realpath $0))/formats/"

if [ ! -d "$FORMATS_DIR" ] ; then
	echo "$FORMATS_DIR is missing. If this script is executed in context of a Docker container, ensure that a bind mount for the formats directory is specified."
	echo "Example: docker run -itv \"\$(pwd)/formats:/formats\" retroload-examples"
	exit 1
fi

for FORMAT in "$(dirname $(realpath $0))/formats/"* ; do
	if [ -d "${FORMAT}" ] ; then
		make -C "${FORMAT}" clean all
	fi
done
