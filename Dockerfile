# syntax=docker/dockerfile:1.7-labs
FROM node:24-alpine

WORKDIR /app
RUN chown node:node /app

USER node

ENV NODE_ENV=production

COPY --chown=node:node --parents **/package*.json ./
RUN npm ci --ignore-scripts

COPY --chown=node:node . ./

EXPOSE 8080

CMD ["node", "server/boot.ts"]
