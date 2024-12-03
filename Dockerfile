# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy only package files first to leverage Docker cache
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source and build
COPY src ./src
COPY data ./data
COPY .env ./

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only necessary files from builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/data ./data
COPY --from=builder /usr/src/app/.env ./

# Install only production dependencies
RUN npm ci --only=production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Use non-root user for security
USER node

# Run the application
CMD ["node", "dist/index.js"]