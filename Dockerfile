FROM node:6
MAINTAINER Jérémie Mercier <jem@dercetech.com>

ADD . /

WORKDIR /

RUN npm install
EXPOSE 3000

CMD ["node", "index.js"]

ENV CFG_ALLOW_GROOT groot
ENV CFG_MDB=mongodb://172.25.0.2:27017/cris
ENV CFG_PWD=CatCantBrainTodayz
ENV IP=0.0.0.0