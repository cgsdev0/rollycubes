FROM node:16 as base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm i

COPY . .

FROM base as production

ENV NODE_PATH=/build
RUN npm run build

FROM gcr.io/distroless/nodejs


COPY --from=production /usr/src/app/build /
EXPOSE 3031
CMD ["index.js"]
