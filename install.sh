#! /bin/sh
echo "Building application via docker with the tag: taxi-analytics"
docker build -t taxi-analytics .
echo "Starting application via docker in the background with container name: dennis-taxi-analytics..."
docker run -p 8080:8080 --restart=always --name dennis-taxi-analytics -d taxi-analytics