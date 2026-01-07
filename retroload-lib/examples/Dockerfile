FROM debian:13-slim
RUN apt-get update && \
        apt-get -y install --no-install-recommends \
        gcc-13 \
        make \
        z80asm \
        xa65 \
        wget \
        ca-certificates \
        python3 \
        python-is-python3 \
        python3-venv \
        git \
        pip \
        build-essential \
        libsndfile1-dev \
        unzip
# 2cdt is incompatible with GCC 14
RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-13 100
RUN python3 -m venv /opt/python-venv
RUN /opt/python-venv/bin/pip install zxtaputils tzxtools
WORKDIR /opt
RUN wget https://www.luigidifraia.com/hosted/software/prg2tap-1.8-linux-x86_64-with-examples.tar.gz && \
        mkdir prg2tap && \
        tar -zxvf prg2tap-1.8-linux-x86_64-with-examples.tar.gz -C prg2tap && \
        ln -s /opt/prg2tap/prg2tap /usr/local/bin/prg2tap
RUN git clone --depth 1 https://github.com/farique1/MSX-Basic-Tokenizer.git && \
        chmod +x /opt/MSX-Basic-Tokenizer/msxbatoken.py && \
        ln -s /opt/MSX-Basic-Tokenizer/msxbatoken.py /usr/local/bin/msxbatoken.py
RUN wget "https://sourceforge.net/projects/a8cas/files/liba8cas/1.5.0/liba8cas-1.5.0.tar.gz/download" -O liba8cas-1.5.0.tar.gz && \
        tar -zxvf liba8cas-1.5.0.tar.gz && \
        cd liba8cas-1.5.0 && \
        ./configure && \
        make install && \
        ldconfig
RUN wget "https://sourceforge.net/projects/a8cas/files/a8cas-tools/1.3.1/a8cas-tools-1.3.1.tar.gz/download" -O a8cas-tools-1.3.1.tar.gz && \
        tar -zxvf a8cas-tools-1.3.1.tar.gz && \
        cd a8cas-tools-1.3.1 && \
        ./configure && \
        make install
RUN git clone --depth 1 --branch v1.4.2 https://github.com/lronaldo/cpctelera.git && \
        cd cpctelera/cpctelera/tools/2cdt && \
        make && \
        ln -s /opt/cpctelera/cpctelera/tools/2cdt/bin/2cdt /usr/local/bin/2cdt
RUN wget "https://sourceforge.net/p/emuscriptoria/code/HEAD/tree/desprot/ZMakeBas.c?format=raw" -O "ZMakeBas.c" && \
        gcc ZMakeBas.c -o ZMakeBas && \
        ln -s /opt/ZMakeBas /usr/local/bin/ZMakeBas
RUN wget "https://www.6809.org.uk/asm6809/dl/asm6809-2.12.tar.gz" -O asm6809-2.12.tar.gz && \
        tar -zxvf asm6809-2.12.tar.gz && \
        cd asm6809-2.12 && \
        ./configure && \
        make install
RUN \
  ln -s /opt/python-venv/bin/bas2tap /usr/local/bin/bas2tap && \
  ln -s /opt/python-venv/bin/tapify /usr/local/bin/tapify && \
  ln -s /opt/python-venv/bin/tzxmerge /usr/local/bin/tzxmerge
COPY /rebuild_all.sh /
CMD [ "/rebuild_all.sh" ]
