#!/bin/sh

set -eu

cd "${0%/*}"

rm -rf build

node_modules/typescript/bin/tsc
cp package.json build/.
cp prod.ormconfig.json build/ormconfig.json

cd build
npm install --only=production

