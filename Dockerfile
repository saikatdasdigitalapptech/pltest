FROM mcr.microsoft.com/playwright:v1.63.0-noble
WORKDIR /work
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV CI=true WORKERS=2
CMD ["npm", "run", "test:smoke"]
