# syntax=docker/dockerfile:1
FROM node:18-alpine AS builder
ADD . .
# Validate versions
RUN node -v && npm -v
# Install Dependencies
RUN npm ci
# Version
RUN node tasks/version.js
# Docs and Static Analysis
RUN npm run lint || true
RUN scripts/codeclimate
# RUN cat ./coverage/lcov.info | node_modules/coveralls/bin/coveralls.js
# RUN scripts/sonar
RUN npm run jsdoc
# RUN node tasks/deploy/docs.js
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
