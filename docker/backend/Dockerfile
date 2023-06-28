FROM node:18-alpine
WORKDIR /app
COPY ./packages/place-mark-api ./
RUN npm ci && npm run build
CMD ["npm", "run", "start"]
EXPOSE 3000
