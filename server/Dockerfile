FROM node:14-slim

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm i

COPY . .

RUN mkdir -p Files/profile_image

#EXPOSE 7654

CMD [ "npm", "start" ]