#!/bin/bash
while getopts p:w: flag
do
    case "${flag}" in
        p) port=${OPTARG};;
        w) workers=${OPTARG};;
    esac
done
venv/bin/gunicorn -b 0.0.0.0:$port -w $workers "main:app"