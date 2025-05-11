FROM --platform=linux/amd64 node:20-alpine AS builder

RUN apk add --no-cache git python3 make g++

RUN rm -f /usr/local/bin/yarn && \
    rm -f /usr/local/bin/yarnpkg && \
    npm uninstall -g yarn

RUN npm install -g yarn@1.22.22 --force

WORKDIR /app

ENV BACKEND_URL=http://host.docker.internal:9001

COPY package.json yarn.lock ./
COPY next.config.js ./
COPY tsconfig.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN NEXT_PUBLIC_DIR=src yarn build

FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./

ENV NEXT_PUBLIC_DIR=src
ENV BACKEND_URL=http://host.docker.internal:9001

EXPOSE 3002
CMD ["node_modules/.bin/next", "dev", "-p", "3002"]

# docker buildx create --use
# docker build --platform=linux/amd64 -t onyxdb-web .
# docker run -p 3002:3002 onyxdb-web