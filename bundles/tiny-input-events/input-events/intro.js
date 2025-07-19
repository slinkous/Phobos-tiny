'use strict';

const fs = require('fs')

module.exports = {
  event: state => socket => {
    const motd  = fs.readFileSync(__dirname + '/../resources/motd').toString('utf8');
    socket.write( motd + "\r\n");
    return socket.emit('login', socket);
  },
};
