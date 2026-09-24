import * as Blockly from 'blockly/core';

// Reusable "value" blocks that plug into the TARGET / POS inputs of command
// blocks. Kept deliberately small: a target selector builder and a
// coordinate builder cover almost every Minecraft command argument that
// isn't a plain resource id (which is just typed into a text field, since a
// dropdown of every item/block/entity in the game would be unusable).

const VALUES_COLOUR = 45;

Blockly.common.defineBlocksWithJsonArray([
  {
    type: 'mc_target_selector',
    message0: '%1 %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'BASE',
        options: [
          ['nearest player @p', '@p'],
          ['random player @r', '@r'],
          ['all players @a', '@a'],
          ['all entities @e', '@e'],
          ['self @s', '@s'],
          ['nearest sensed entity @n', '@n'],
        ],
      },
      {
        type: 'field_input',
        name: 'ARGS',
        text: '',
      },
    ],
    output: 'String',
    colour: VALUES_COLOUR,
    tooltip:
      'A target selector. Leave the second field blank, or fill it with ' +
      'selector arguments without brackets, e.g. type=cow,limit=5,distance=..10',
    helpUrl: 'https://minecraft.wiki/w/Target_selectors',
  },
  {
    type: 'mc_position',
    message0: 'x %1 y %2 z %3',
    args0: [
      { type: 'field_input', name: 'X', text: '~' },
      { type: 'field_input', name: 'Y', text: '~' },
      { type: 'field_input', name: 'Z', text: '~' },
    ],
    inputsInline: true,
    output: 'String',
    colour: VALUES_COLOUR,
    tooltip:
      'A set of coordinates. Use ~ for relative, ~5 for relative offset, ' +
      'or ^ ^ ^ for local coordinates, or plain numbers for absolute.',
    helpUrl: 'https://minecraft.wiki/w/Coordinates',
  },
]);
