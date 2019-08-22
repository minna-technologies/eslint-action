#!/bin/sh

set -e
yarn

NODE_PATH=/action/node_modules:node_modules node /action/main.js
