ARG NODE_VERSION=22.16.0

FROM node:${NODE_VERSION}-slim AS base
WORKDIR /usr/src/app
EXPOSE 3000

# install ssl apk
RUN apt-get update -y \
    && apt-get install -y openssl

FROM base AS dev
# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# run migrations npx prisma migrate dev
RUN npx prisma generate

CMD ["npm", "run", "dev"]
