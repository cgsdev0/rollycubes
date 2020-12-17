#!/bin/bash

branch=$(git rev-parse --abbrev-ref HEAD)

case "$branch" in
    beta)
    # build server
    make release && \
        ssh root@shaneschulte.com systemctl stop dice_beta && \
        scp GameServer root@shaneschulte.com:/usr/bin/GameServer_beta && \
        ssh root@shaneschulte.com systemctl start dice_beta

    # build client
    cd client
    rm -rf build && \
        yarn build && \
        ssh root@shaneschulte.com sudo rm -rf /var/www/beta && \
        scp -r build root@shaneschulte.com:/var/www/beta
    ;;
    master)
    # build server
    make release && \
        ssh root@shaneschulte.com systemctl stop dice && \
        scp GameServer root@shaneschulte.com:/usr/bin/GameServer && \
        ssh root@shaneschulte.com systemctl start dice

    # build client
    cd client
    rm -rf build && \
        yarn build && \
        ssh root@shaneschulte.com sudo rm -rf /var/www/build && \
        scp -r build root@shaneschulte.com:/var/www/.
    ;;

    *)
    echo "Not a release-able branch!"
    exit 1
    ;;
esac
