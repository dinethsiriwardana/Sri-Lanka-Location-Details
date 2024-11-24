# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all files to the container
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Set the working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy the built application and necessary files from the builder stage
COPY --from=builder /app/data ./data
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Set user to root temporarily
USER root

# Change permissions
RUN chown -R 10014:10014 /app

# Switch back to non-root user
USER 10014

# Expose application port
EXPOSE 3000

# Command to start the application
CMD ["node", "dist/index.js"]
