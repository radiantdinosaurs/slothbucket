# picking the base image
FROM andrewvora/imagenet-tensorflow

# metadata
LABEL version = "1.0"
LABEL description = "Docker image for Slothbucket, an image host for sloth pictures."
LABEL maintainer = "Bethany Corder <radiantdinosaurs@gmail.com>"
ARG buildtime_secret=default_value
ENV SECRET=$buildtime_secret
ARG buildtime_db=default_value
ENV DB_URL=$buildtime_db

# specifying working directory
WORKDIR /slothbucket

# bundling app source
COPY . .

# copying and installing app dependencies to the working directory
# COPY package*.json ./
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
RUN npm install
RUN npm install pm2 -g

CMD ["pm2-runtime", "process.yml"]