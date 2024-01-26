#!/bin/bash
#bin script
rebasingBranch() {
    locations=('rebase-merge' 'rebase-apply')
    for location in "${locations[@]}"; do
        path=$(git rev-parse --git-path ${location})
        if test -d ${path}; then
            revision=$(<${path}/head-name)
            BRANCHNAME=${revision##refs/heads/}
            return 0
        else 
            BRANCHNAME=$(git branch --show-current)
        fi
    done
}

DEBUG=commit-msg-helper node ./dist/index.js -f $1 -b $BRANCHNAME   