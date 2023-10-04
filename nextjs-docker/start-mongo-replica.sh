#!/bin/bash

# 生成 mongo-keyfile
sudo openssl rand -base64 756 > ./mongo/mongo-keyfile
sudo chmod 600 ./mongo/mongo-keyfile

# sudo docker build -t replica-mongo:4.4 .

# 啟動 docker-compose
sudo docker-compose up -d --build
