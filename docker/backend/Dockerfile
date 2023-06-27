FROM node:18-alpine
WORKDIR /application
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./packages/place-mark-core ./packages/place-mark-core/
COPY ./packages/place-mark-web/package.json  ./packages/place-mark-web/
COPY ./packages/place-mark-api ./packages/place-mark-api/
RUN npm ci
RUN npm run build:api
RUN npm prune --production --workspace packages/place-mark-api
RUN find ./packages/place-mark-api -mindepth 1 ! -regex '^./packages/place-mark-api/dist\(/.*\)?' -delete
CMD ["npm", "run", "start:api"]
EXPOSE 3000
