# Use Node.js v18 for consistency with the current development environment
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first (optimizes build caching)
COPY package.json package-lock.json ./

# Use npm ci for consistent dependency installation
RUN npm ci

# Copy the rest of the app files
COPY . .

# Expose the port Expo uses (default is 19000, but can be dynamic)
EXPOSE 19000

# Define the default command to start the Expo app
# Using npm start with --web for web platform focus
CMD ["npm", "start", "--", "--web"]
