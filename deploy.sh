#!/bin/bash

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


# make release && \
#     ssh root@shaneschulte.com systemctl stop dice && \
#     scp GameServer root@shaneschulte.com:/usr/bin/. && \
#     ssh root@shaneschulte.com systemctl start dice
