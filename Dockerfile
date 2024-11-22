FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Create a user with a specific UID between 10000 and 20000
RUN addgroup -g 10001 choreogroup && \
    adduser -u 10001 -G choreogroup -s /sbin/nologin -D choreo

# Copy package files and other necessary files into the container
COPY package*.json ./
COPY tsconfig.json .
COPY src ./src
COPY data ./data

# Install dependencies and build the application
RUN npm install
RUN npm run build

# Fix permissions for all application files and directories
RUN chown -R 10001:10001 /usr/src/app

# Create and set permissions for npm cache and logs
RUN mkdir -p /.npm && chown -R 10001:10001 /.npm
RUN mkdir -p /.npm/_logs && chown -R 10001:10001 /.npm/_logs

# Switch to the non-root user
USER 10001

# Expose the app's port
EXPOSE 3000

# Use node directly instead of npm to better handle signals
CMD ["node", "dist/index.js"]