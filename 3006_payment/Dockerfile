FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install


COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3006

CMD ["npm", "run", "dev"]
