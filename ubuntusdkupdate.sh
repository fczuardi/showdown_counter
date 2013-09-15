#!/usr/bin/env bash
git pull origin master
npm install
rm -rf build
rm -rf ../counters/html
grunt curl
grunt
mkdir ../counters/html
cp -R build/www/. ../counters/html/.
