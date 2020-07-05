FROM node:10.21.0-jessie

WORKDIR /usr/src/motorsport-api

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]