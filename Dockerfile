FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Create a user with a specified UID (fix permission issue for npm cache)
RUN adduser --disabled-password --gecos "" --home "/nonexistent" --shell "/sbin/nologin" --no-create-home --uid 10014 "choreo"

# Copy package files and other necessary files into the container
COPY package*.json ./
COPY tsconfig.json .
COPY src ./src
COPY data ./data

# Install dependencies and build the application
RUN npm install
RUN npm run build

# Fix permissions for all application files and directories
RUN chown -R choreo:choreo /usr/src/app

# Create and set permissions for npm cache and logs
RUN mkdir -p /.npm && chown -R choreo:choreo /.npm
RUN mkdir -p /.npm/_logs && chown -R choreo:choreo /.npm/_logs

# Switch to the new user (choreo)
USER choreo

# Expose the app's port
EXPOSE 3000

# Add this before the CMD line
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
    
# Use node directly instead of npm to better handle signals
CMD ["node", "dist/index.js"]