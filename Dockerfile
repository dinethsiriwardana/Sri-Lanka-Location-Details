# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json tsconfig.json ./

# Generate package-lock.json and install dependencies
RUN npm install

# Copy source files
COPY src ./src
COPY data ./data
COPY public ./public
COPY .env ./
COPY openapi.yaml* ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only necessary files from builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/data ./data
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.env ./
COPY --from=builder /usr/src/app/openapi.yaml* ./


# Install only production dependencies
RUN npm ci --omit=dev

# Set NODE_ENV to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000


# Run the application
CMD ["node", "dist/index.js"]