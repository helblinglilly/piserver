#!/bin/bash
PROCESSID=$(lsof -ti:9090)

if [ -z "${PROCESSID}" ] 
then
    echo "nothing has been found"
    exit 0
else
    echo "found"
    kill -9 $PROCESSID
    exit 0
fi