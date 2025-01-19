#!/bin/bash
while getopts p: flag
do
    case "${flag}" in
        p) port=${OPTARG};;
    esac
done
gunicorn -b 0.0.0.0:$port -w 4 "main:app"