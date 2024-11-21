FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package files and other necessary files into the container
COPY package*.json ./
COPY tsconfig.json .
COPY src ./src
COPY data ./data

# Install dependencies and build the application
RUN npm install
RUN npm run build

# Create a user with a specified UID (fix permission issue for npm cache)
RUN adduser --disabled-password --gecos "" --home "/nonexistent" --shell "/sbin/nologin" --no-create-home --uid 10014 "choreo"

# Fix npm permissions (allow user to write to npm cache)
RUN mkdir -p /usr/src/app/.npm && chown -R choreo:choreo /usr/src/app/.npm /usr/src/app/node_modules

# Switch to the new user (choreo)
USER choreo

# Expose the app's port
EXPOSE 3000

# Run the app using npm
CMD ["npm", "start"]
