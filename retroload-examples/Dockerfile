FROM debian:11
RUN apt-get update && \
        apt-get -y install --no-install-recommends \
        make \
        z80asm \
        xa65 \
        wget \
        ca-certificates \
        python3 \
        python-is-python3 \
        git \
        pip \
        build-essential \
        libsndfile1-dev \
        unzip
RUN pip install zxtaputils tzxtools
WORKDIR /opt
RUN wget https://www.luigidifraia.com/hosted/software/prg2tap-1.8-linux-x86_64-with-examples.tar.gz && \
        tar -zxvf prg2tap-1.8-linux-x86_64-with-examples.tar.gz && \
        ln -s /opt/prg2tap-1.8-linux-x86_64-with-examples/prg2tap /usr/local/bin/prg2tap
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
COPY /rebuild_all.sh /
CMD [ "/rebuild_all.sh" ]
