#!/bin/bash
while getopts i:p: flag
do
    case "${flag}" in
        i) ip=${OPTARG};;
        p) port=${OPTARG};;
    esac
done
gunicorn -b 127.0.0.1:8001 "main:app" $ip $port