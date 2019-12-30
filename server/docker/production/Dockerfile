FROM node:12

# Create Directory for the Container
WORKDIR /usr/src/app

# Only copy the package.json file to work directory
COPY package.json .

# Install dependencies
RUN npm install

# copy source code
COPY . .

# compile the code
RUN ["npm", "run", "build:prod"]

# start the compiled code
EXPOSE 7001
CMD [ "node", "./dist/bundle.js"]


