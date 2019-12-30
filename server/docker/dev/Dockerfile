FROM node:12

# Create Directory for the Container
WORKDIR /usr/src/app

# Only copy the package.json file to work directory
COPY package.json .

# Install all Packages
RUN npm install

# Copy all other source code to work directory
COPY . .

# Start
EXPOSE 7001
ENTRYPOINT [ "npm", "run", "start:dev" ]
