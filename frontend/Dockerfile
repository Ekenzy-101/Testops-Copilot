# Use official Node.js image
FROM node:24.10.0-alpine AS build

ARG PUBLIC_API_BASE_URL

# Set the working directory
WORKDIR /app

# Copy the package.json and package.lock.json files
COPY ./package*.json .

# Install Node.js dependencies
RUN npm ci

# Copy the remaining source code
COPY . .

# Build source code
RUN npm run build

# Use official Node.js image
FROM node:24.10.0-alpine AS production

# Create a non-privileged user to run the application
RUN npm install -g serve && \
  addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set the working directory
WORKDIR /app

# Copy the build folder for production
COPY --from=build --chown=nodejs:nodejs /app/build ./build

# Switch to the non-privileged user
USER nodejs

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["serve", "-s", "build", "-l", "tcp://0.0.0.0:3000"]