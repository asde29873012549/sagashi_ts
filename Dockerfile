# !/bin/bash
# Use the official Node.js 20 image from Docker Hub
FROM node:lts-alpine3.18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source inside Docker image
COPY . .

# Build image
RUN npm run build

# Your app binds to port 8080 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000

ENV NODE_ENV production

# Define the command to run your app using CMD which defines your runtime
CMD ["npm", "start"]
