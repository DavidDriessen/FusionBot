FROM node:12.14 AS web-interface
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
COPY bin/ ../
RUN npm run build

FROM node:12.14

RUN apt-get update && apt-get install -y \
  wget \
  unzip \
  fontconfig \
  locales \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  libappindicator1 \
  libnss3 \
  lsb-release \
  xdg-utils \
  wget

RUN mkdir -p /app
WORKDIR /app
COPY package*.json ./

#RUN npm install
# If you are building your code for production
RUN npm ci --only=production

COPY bin ./bin
COPY migrate.js ./migrate.js
COPY app.js ./app.js
COPY models ./models
COPY routes ./routes
COPY migrations ./migrations
COPY discordbot ./discordbot

RUN mkdir ./tmp
RUN mkdir ./public
COPY --from=web-interface /app/client/dist ./public

EXPOSE 3000
ENV NODE_ENV production

ENTRYPOINT ["npm"]
CMD ["run", "start"]
