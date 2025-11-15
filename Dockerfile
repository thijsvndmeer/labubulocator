# Use a base image with Node.js
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy all files from the context to the /app directory
# This is simpler for a monorepo and ensures all dependencies are available.
COPY . .

# Install dependencies and build the 'common' package
RUN cd common && npm install && npm run build

# Install dependencies and build the 'backend' package
# Using --production=false to ensure devDependencies (like typescript) are available for the build
RUN cd backend && npm install --production=false && npm run build

# Set the final working directory to the backend
WORKDIR /app/backend

# Expose the port the app runs on
EXPOSE 8080

# The command to start the app
CMD ["node", "dist/src/index.js"]
