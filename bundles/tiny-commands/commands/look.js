'use strict';
const { Broadcast: B, Item, Logger, Player } = require('ranvier');
const ArgParser = require('../../../lib/ArgParser');
const ItemUtil = require('../../../lib/ItemUtil');

module.exports = {
  usage: "look [target]",
  command: state => function (args, player) {
    if (!player.room) {
      Logger.error(player.getName() + ' is in limbo.');
      return B.sayAt(player, 'You are in a deep, dark void.');
    }

    if(args){
      return lookEntity(state, player, args)
    }

    const { room } = player;

    B.sayAt(player, room.title);
    B.sayAt(player, B.line(60));
    B.sayAt(player, room.description, 80);

    for (const otherPlayer of room.players) {
      if (otherPlayer === player) {
        continue;
      }

      B.sayAt(player, `[Player] ${otherPlayer.name}`);
    }

    for (const npc of room.npcs) {
      B.sayAt(player, `[NPC] ${npc.name}`);
    }

    for (const item of room.items) {
      B.sayAt(player, `[Item] ${item.roomDesc}`);
    }

    const exits = room.getExits();
    const foundExits = [];

    // prioritize explicit over inferred exits with the same name
    for (const exit of exits) {
      if (foundExits.find(fe => fe.direction === exit.direction)) {
        continue;
      }

      foundExits.push(exit);
    }

    B.at(player, '[Exits: ');
    B.at(player, foundExits.map(exit => {
      const exitRoom = state.RoomManager.getRoom(exit.roomId);
      const door = room.getDoor(exitRoom) || exitRoom.getDoor(room);
      if (door && (door.locked || door.closed)) {
        return '(' + exit.direction + ')';
      }

      return exit.direction;
    }).join(' '));

    if (!foundExits.length) {
      B.at(player, 'none');
    }
    B.sayAt(player, ']');

  },
};

function lookEntity(state, player, args) {
  const room = player.room;

  args = args.split(' ');
  let search = null;

  if (args.length > 1) {
    search = args[0] === 'in' ? args[1] : args[0];
  } else {
    search = args[0];
  }

  let entity = ArgParser.parseDot(search, room.items);
  entity = entity || ArgParser.parseDot(search, room.players);
  entity = entity || ArgParser.parseDot(search, room.npcs);
  entity = entity || ArgParser.parseDot(search, player.inventory);

  if (!entity) {
    return B.sayAt(player, "You don't see anything like that here.");
  }

  if (entity instanceof Player) {
    // TODO: Show player equipment?
    B.sayAt(player, `You see fellow player ${entity.name}.`);
    return;
  }

  B.sayAt(player, entity.description, 80);

  if (entity.timeUntilDecay) {
    B.sayAt(player, `You estimate that ${entity.name} will rot away in ${humanize(entity.timeUntilDecay)}.`);
  }

  const usable = entity.getBehavior('usable');
  if (usable) {
    if (usable.spell) {
      const useSpell = state.SpellManager.get(usable.spell);
      if (useSpell) {
        useSpell.options = usable.options;
        B.sayAt(player, useSpell.info(player));
      }
    }

    if (usable.effect && usable.config.description) {
      B.sayAt(player, usable.config.description);
    }

    if (usable.charges) {
      B.sayAt(player, `There are ${usable.charges} charges remaining.`);
    }
  }

  if (entity instanceof Item) {
    switch (entity.type) {
      case ItemType.WEAPON:
      case ItemType.ARMOR:
        return B.sayAt(player, ItemUtil.renderItem(state, entity, player));
      case ItemType.CONTAINER: {
        if (!entity.inventory || !entity.inventory.size) {
          return B.sayAt(player, `${entity.name} is empty.`);
        }

        if (entity.closed) {
          return B.sayAt(player, `It is closed.`);
        }

        B.at(player, 'Contents');
        if (isFinite(entity.inventory.getMax())) {
          B.at(player, ` (${entity.inventory.size}/${entity.inventory.getMax()})`);
        }
        B.sayAt(player, ':');

        for (const [, item ] of entity.inventory) {
          B.sayAt(player, '  ' + ItemUtil.display(item));
        }
        break;
      }
    }
  }
}
