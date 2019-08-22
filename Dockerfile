FROM node:10-alpine AS builder
WORKDIR /build
COPY . .
RUN npm install -g yarn
RUN yarn install
RUN yarn run build

FROM node:10-alpine AS output
WORKDIR /action
CMD /action/entrypoint.sh
COPY entrypoint.sh ./
COPY --from=builder ./build/dist ./
COPY package.json ./
RUN npm install --production
