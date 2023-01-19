FROM debian
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
        pip
RUN pip install zxtaputils tzxtools
WORKDIR /opt
RUN wget https://www.luigidifraia.com/hosted/software/prg2tap-1.8-linux-x86_64-with-examples.tar.gz && \
        tar -zxvf prg2tap-1.8-linux-x86_64-with-examples.tar.gz && \
        ln -s /opt/prg2tap-1.8-linux-x86_64-with-examples/prg2tap /usr/local/bin/prg2tap
RUN git clone https://github.com/farique1/MSX-Basic-Tokenizer.git && \
        chmod +x /opt/MSX-Basic-Tokenizer/msxbatoken.py && \
        ln -s /opt/MSX-Basic-Tokenizer/msxbatoken.py /usr/local/bin/msxbatoken.py
COPY /rebuild_all.sh /
CMD [ "/rebuild_all.sh" ]

