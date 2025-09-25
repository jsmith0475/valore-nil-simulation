# frontend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY ui/package.json ui/package-lock.json* ./
RUN npm install
COPY ui .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
