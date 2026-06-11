FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3006

CMD ["npm", "run", "dev"]
