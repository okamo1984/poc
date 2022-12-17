#!/bin/bash

pushd $(dirname $0) >/dev/null

cd ../terraform
if [ "$1" = "apply" ]; then
    terraform validate
    terraform apply
else
    terraform destroy
fi

popd >/dev/null
