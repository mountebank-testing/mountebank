# syntax=docker/dockerfile:1
FROM node:18-alpine AS builder
ADD . .
# Validate versions
RUN node -v && npm -v
# Install Dependencies
RUN npm ci
# Version
RUN node tasks/version.js
RUN npm run jsdoc
# Dist
RUN node tasks/dist.js

FROM node:18-alpine

WORKDIR /app

# Install tarball to allow the command to be 'mb' instead of 'bin/mb'
COPY --from=builder dist/mountebank/mountebank-*.tgz ./
RUN npm install --production -g mountebank-*.tgz && npm cache clean -f

# Run as a non-root user
RUN adduser -D mountebank
RUN chown -R mountebank /app
USER mountebank

EXPOSE 2525

ENTRYPOINT ["mb"]
