#!/bin/bash

pushd $(dirname $0) >/dev/null

cd ..
poetry build
cd packer
packer build -var-file=azure-secret.json -var 'image_name=speedrun-python' base-image.json

popd >/dev/null
