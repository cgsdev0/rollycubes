#!/bin/bash

make release && \
    ssh root@shaneschulte.com systemctl stop dice && \
    scp GameServer root@shaneschulte.com:/usr/bin/. && \
    ssh root@shaneschulte.com systemctl start dice
