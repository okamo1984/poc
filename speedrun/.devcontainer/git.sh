#!/bin/bash
git config --global user.name $GIT_USERNAME
git config --global user.email $GIT_EMAIL
echo $GITHUB_CLI_TOKEN > /tmp/githubtoken
gh auth login --with-token < /tmp/githubtoken
rm /tmp/githubtoken
