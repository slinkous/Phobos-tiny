'use strict';

const { Broadcast } = require('ranvier');

module.exports = {
    usage: 'pose [message]',
    aliases: [':'],
    command: (state) => (args, player) => {
        
        const argsMessage = player.name + " " + args.trim(); //we may want to handle letting players chose spacing. Or handle possessives specifically.

        player.room.players.forEach(p => {
            Broadcast.sayAt(p, argsMessage)
        })
        
    }
}