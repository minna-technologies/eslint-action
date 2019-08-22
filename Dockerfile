FROM node:10-alpine AS builder
WORKDIR /build
COPY . .
RUN npm install
RUN npm run build

FROM node:10-alpine AS output
WORKDIR /action
CMD entrypoint.sh
COPY entrypoint.sh ./
COPY --from=builder ./build/dist ./
COPY package.json ./
RUN npm install --production
