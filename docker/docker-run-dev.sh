#!/bin/bash
echo "STARTING DEVICES SERVICE"
# rm -rf node_modules
# Install the project dependencies
yarn install --network-concurrency 1
# yarn install

# Start the API server on development mode
yarn run start:dev