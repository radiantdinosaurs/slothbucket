# picking the base image
FROM atong01/imagenet-tensorflow

# metadata
LABEL version = "1.0"
LABEL description = "Docker image for Slothbucket, an image host for sloth pictures."
LABEL maintainer = "Bethany Corder <radiantdinosaurs@gmail.com>"

# specifying working directory
WORKDIR /slothbucket

# bundling app source
COPY . .

# copying and installing app dependencies to the working directory
#COPY package*.json ./
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
RUN npm install

EXPOSE 8000
CMD ["npm", "start"]