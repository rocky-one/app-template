FROM node:14.5.0-alpine3.12
ENV NODE_ENV production
RUN rm -rf /usr/local/app
RUN mkdir /usr/local/app
WORKDIR /usr/local/app
COPY ./package.json /usr/local/app
RUN npm install
COPY . /usr/local/app
EXPOSE 8090
CMD node ./bin/www
