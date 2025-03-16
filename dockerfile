# Use Node.js official image from DockerHub
FROM oven/bun:1 as base

# Set working directory inside the container
WORKDIR /

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy all project files
COPY . .

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "index.js"]
