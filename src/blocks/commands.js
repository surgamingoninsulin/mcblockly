import * as Blockly from 'blockly/core';

// All command blocks share the "Command" connection check, so they only
// stack with each other (and with the RUN slot of execute blocks) inside a
// function's workspace.

const COLOUR = {
  chat: 200,
  items: 140,
  world: 100,
  scoreboard: 290,
  tags: 225,
  execute: 0,
  misc: 0,
};

const commandBlocks = [
  // ---------------------------------------------------------------- misc
  {
    type: 'mc_comment',
    message0: '# %1',
    args0: [{ type: 'field_input', name: 'TEXT', text: 'comment' }],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: '#757575',
    tooltip: 'A comment line. Ignored by Minecraft, useful for notes.',
  },
  {
    type: 'mc_raw_command',
    message0: 'raw command %1',
    args0: [
      { type: 'field_input', name: 'TEXT', text: 'say hello' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: '#757575',
    tooltip:
      'Escape hatch: type any command exactly as it should appear in the ' +
      '.mcfunction file, for commands not covered by other blocks.',
  },

  // ---------------------------------------------------------------- chat
  {
    type: 'mc_say',
    message0: 'say %1',
    args0: [{ type: 'field_input', name: 'MESSAGE', text: 'Hello world' }],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.chat,
  },
  {
    type: 'mc_tellraw',
    message0: 'tellraw %1 message %2',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'MESSAGE', text: 'Hello' },
    ],
    inputsInline: true,
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.chat,
  },
  {
    type: 'mc_title',
    message0: 'title %1 %2 %3',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      {
        type: 'field_dropdown',
        name: 'ACTION',
        options: [
          ['title', 'title'],
          ['subtitle', 'subtitle'],
          ['actionbar', 'actionbar'],
          ['clear', 'clear'],
          ['reset', 'reset'],
        ],
      },
      { type: 'field_input', name: 'MESSAGE', text: 'Hello' },
    ],
    inputsInline: true,
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.chat,
  },
  {
    type: 'mc_playsound',
    message0: 'playsound %1 source %2 to %3 at %4 volume %5 pitch %6',
    args0: [
      { type: 'field_input', name: 'SOUND', text: 'minecraft:entity.experience_orb.pickup' },
      {
        type: 'field_dropdown',
        name: 'SOURCE',
        options: [
          ['master', 'master'], ['music', 'music'], ['record', 'record'],
          ['weather', 'weather'], ['block', 'block'], ['hostile', 'hostile'],
          ['neutral', 'neutral'], ['player', 'player'], ['ambient', 'ambient'],
          ['voice', 'voice'],
        ],
      },
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'input_value', name: 'POS', check: 'String' },
      { type: 'field_number', name: 'VOLUME', value: 1, min: 0 },
      { type: 'field_number', name: 'PITCH', value: 1, min: 0, max: 2 },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.chat,
  },

  // --------------------------------------------------------- items/mobs
  {
    type: 'mc_give',
    message0: 'give %1 item %2 count %3 nbt/components %4',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'ITEM', text: 'minecraft:diamond' },
      { type: 'field_number', name: 'COUNT', value: 1, min: 1 },
      { type: 'field_input', name: 'EXTRA', text: '' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
    tooltip: 'Leave "nbt/components" blank for none, e.g. [enchantments={}]',
  },
  {
    type: 'mc_clear',
    message0: 'clear %1 item %2 max count %3',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'ITEM', text: '' },
      { type: 'field_number', name: 'COUNT', value: -1 },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
    tooltip: 'Leave item blank to clear all items. Count -1 means unlimited.',
  },
  {
    type: 'mc_effect_give',
    message0: 'effect give %1 effect %2 duration(s) %3 amplifier %4 hide particles %5',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'EFFECT', text: 'minecraft:speed' },
      { type: 'field_input', name: 'DURATION', text: '30' },
      { type: 'field_number', name: 'AMPLIFIER', value: 0, min: 0 },
      { type: 'field_checkbox', name: 'HIDE', checked: false },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
    tooltip: 'Duration accepts a number of seconds or "infinite".',
  },
  {
    type: 'mc_effect_clear',
    message0: 'effect clear %1 effect %2',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'EFFECT', text: '' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
    tooltip: 'Leave effect blank to clear all effects.',
  },
  {
    type: 'mc_summon',
    message0: 'summon %1 at %2 nbt %3',
    args0: [
      { type: 'field_input', name: 'ENTITY', text: 'minecraft:zombie' },
      { type: 'input_value', name: 'POS', check: 'String' },
      { type: 'field_input', name: 'NBT', text: '' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
  },
  {
    type: 'mc_kill',
    message0: 'kill %1',
    args0: [{ type: 'input_value', name: 'TARGET', check: 'String' }],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
  },
  {
    type: 'mc_tp_to_pos',
    message0: 'teleport %1 to %2',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'input_value', name: 'POS', check: 'String' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
  },
  {
    type: 'mc_tp_to_entity',
    message0: 'teleport %1 to entity %2',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'input_value', name: 'DEST', check: 'String' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
  },
  {
    type: 'mc_gamemode',
    message0: 'gamemode %1 for %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'MODE',
        options: [
          ['survival', 'survival'], ['creative', 'creative'],
          ['adventure', 'adventure'], ['spectator', 'spectator'],
        ],
      },
      { type: 'input_value', name: 'TARGET', check: 'String' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
  },
  {
    type: 'mc_xp_add',
    message0: 'xp add %1 amount %2 %3',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_number', name: 'AMOUNT', value: 1 },
      {
        type: 'field_dropdown',
        name: 'UNIT',
        options: [['points', 'points'], ['levels', 'levels']],
      },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.items,
  },

  // --------------------------------------------------------------- world
  {
    type: 'mc_setblock',
    message0: 'setblock at %1 block %2 mode %3',
    args0: [
      { type: 'input_value', name: 'POS', check: 'String' },
      { type: 'field_input', name: 'BLOCK', text: 'minecraft:stone' },
      {
        type: 'field_dropdown',
        name: 'MODE',
        options: [['replace', 'replace'], ['destroy', 'destroy'], ['keep', 'keep']],
      },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.world,
  },
  {
    type: 'mc_fill',
    message0: 'fill from %1 to %2 block %3 mode %4',
    args0: [
      { type: 'input_value', name: 'POS1', check: 'String' },
      { type: 'input_value', name: 'POS2', check: 'String' },
      { type: 'field_input', name: 'BLOCK', text: 'minecraft:stone' },
      {
        type: 'field_dropdown',
        name: 'MODE',
        options: [
          ['replace', 'replace'], ['destroy', 'destroy'], ['keep', 'keep'],
          ['hollow', 'hollow'], ['outline', 'outline'], ['air', 'air'],
        ],
      },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.world,
  },
  {
    type: 'mc_clone',
    message0: 'clone from %1 to %2 destination %3',
    args0: [
      { type: 'input_value', name: 'POS1', check: 'String' },
      { type: 'input_value', name: 'POS2', check: 'String' },
      { type: 'input_value', name: 'POS3', check: 'String' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.world,
  },
  {
    type: 'mc_time_set',
    message0: 'time set %1',
    args0: [{ type: 'field_input', name: 'VALUE', text: 'day' }],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.world,
    tooltip: 'Accepts day, night, noon, midnight, or a tick number.',
  },
  {
    type: 'mc_time_add',
    message0: 'time add %1',
    args0: [{ type: 'field_number', name: 'AMOUNT', value: 1, min: 0 }],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.world,
  },
  {
    type: 'mc_weather',
    message0: 'weather %1 duration(s) %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'TYPE',
        options: [['clear', 'clear'], ['rain', 'rain'], ['thunder', 'thunder']],
      },
      { type: 'field_number', name: 'DURATION', value: 0, min: 0 },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.world,
    tooltip: 'Duration 0 means unspecified (random duration).',
  },
  {
    type: 'mc_difficulty',
    message0: 'difficulty %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'LEVEL',
        options: [
          ['peaceful', 'peaceful'], ['easy', 'easy'],
          ['normal', 'normal'], ['hard', 'hard'],
        ],
      },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.world,
  },

  // --------------------------------------------------------- scoreboard
  {
    type: 'mc_scoreboard_obj_add',
    message0: 'scoreboard objective %1 add, criteria %2 display name %3',
    args0: [
      { type: 'field_input', name: 'OBJECTIVE', text: 'counter' },
      {
        type: 'field_dropdown',
        name: 'CRITERIA',
        options: [
          ['dummy', 'dummy'], ['trigger', 'trigger'], ['health', 'health'],
          ['food', 'food'], ['air', 'air'], ['xp', 'xp'], ['level', 'level'],
          ['deathCount', 'deathCount'], ['playerKillCount', 'playerKillCount'],
          ['totalKillCount', 'totalKillCount'],
        ],
      },
      { type: 'field_input', name: 'DISPLAY', text: '' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.scoreboard,
    tooltip: 'Leave display name blank to use the objective name.',
  },
  {
    type: 'mc_scoreboard_obj_remove',
    message0: 'scoreboard objective %1 remove',
    args0: [{ type: 'field_input', name: 'OBJECTIVE', text: 'counter' }],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.scoreboard,
  },
  {
    type: 'mc_scoreboard_obj_display',
    message0: 'scoreboard display slot %1 shows %2',
    args0: [
      {
        type: 'field_dropdown',
        name: 'SLOT',
        options: [['sidebar', 'sidebar'], ['list', 'list'], ['belowName', 'belowName']],
      },
      { type: 'field_input', name: 'OBJECTIVE', text: 'counter' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.scoreboard,
  },
  {
    type: 'mc_scoreboard_players_set',
    message0: 'scoreboard player %1 objective %2 set to %3',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'OBJECTIVE', text: 'counter' },
      { type: 'field_number', name: 'VALUE', value: 0 },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.scoreboard,
  },
  {
    type: 'mc_scoreboard_players_add',
    message0: 'scoreboard player %1 objective %2 add %3',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'OBJECTIVE', text: 'counter' },
      { type: 'field_number', name: 'VALUE', value: 1 },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.scoreboard,
  },
  {
    type: 'mc_scoreboard_players_remove',
    message0: 'scoreboard player %1 objective %2 subtract %3',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'OBJECTIVE', text: 'counter' },
      { type: 'field_number', name: 'VALUE', value: 1 },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.scoreboard,
  },
  {
    type: 'mc_scoreboard_players_reset',
    message0: 'scoreboard player %1 objective %2 reset',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'OBJECTIVE', text: '' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.scoreboard,
    tooltip: 'Leave objective blank to reset every objective for the target.',
  },
  {
    type: 'mc_scoreboard_players_op',
    message0: 'scoreboard player %1 objective %2 %3 player %4 objective %5',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'OBJECTIVE', text: 'counter' },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [
          ['= (set)', '='], ['+= (add)', '+='], ['-= (subtract)', '-='],
          ['*= (multiply)', '*='], ['/= (divide)', '/='], ['%= (modulo)', '%='],
          ['< (min)', '<'], ['> (max)', '>'], ['>< (swap)', '><'],
        ],
      },
      { type: 'input_value', name: 'SOURCE', check: 'String' },
      { type: 'field_input', name: 'SOURCE_OBJECTIVE', text: 'counter' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.scoreboard,
  },

  // ------------------------------------------------------ tags/functions
  {
    type: 'mc_tag_add',
    message0: 'tag %1 add %2',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'TAG', text: 'my_tag' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.tags,
  },
  {
    type: 'mc_tag_remove',
    message0: 'tag %1 remove %2',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'TAG', text: 'my_tag' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.tags,
  },
  {
    type: 'mc_function_call',
    message0: 'run function %1',
    args0: [{ type: 'field_input', name: 'FUNCTION', text: 'namespace:path' }],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.tags,
  },
  {
    type: 'mc_schedule_function',
    message0: 'schedule function %1 in %2 mode %3',
    args0: [
      { type: 'field_input', name: 'FUNCTION', text: 'namespace:path' },
      { type: 'field_input', name: 'TIME', text: '10s' },
      {
        type: 'field_dropdown',
        name: 'MODE',
        options: [['replace', 'replace'], ['append', 'append']],
      },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.tags,
    tooltip: 'Time accepts a number of ticks, or a value with s/t/d suffix e.g. 5s, 100t.',
  },
  {
    type: 'mc_schedule_clear',
    message0: 'schedule clear %1',
    args0: [{ type: 'field_input', name: 'FUNCTION', text: 'namespace:path' }],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.tags,
  },

  // ----------------------------------------------------- execute / flow
  {
    type: 'mc_execute_as',
    message0: 'execute as %1 at self? %2 run %3',
    args0: [
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_checkbox', name: 'AT_SELF', checked: true },
      { type: 'input_statement', name: 'RUN', check: 'Command' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.execute,
    tooltip:
      'Runs the single command inside as the given target. "at self?" ' +
      'also moves the execution position to the target (adds "at @s").',
  },
  {
    type: 'mc_execute_positioned',
    message0: 'execute positioned at %1 run %2',
    args0: [
      { type: 'input_value', name: 'POS', check: 'String' },
      { type: 'input_statement', name: 'RUN', check: 'Command' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.execute,
  },
  {
    type: 'mc_execute_if_score_compare',
    message0: 'execute %1 score %2 %3 %4 score %5 %6 run %7',
    args0: [
      {
        type: 'field_dropdown',
        name: 'INVERT',
        options: [['if', 'if'], ['unless', 'unless']],
      },
      { type: 'input_value', name: 'TARGET1', check: 'String' },
      { type: 'field_input', name: 'OBJ1', text: 'counter' },
      {
        type: 'field_dropdown',
        name: 'OP',
        options: [['<', '<'], ['<=', '<='], ['=', '='], ['>=', '>='], ['>', '>']],
      },
      { type: 'input_value', name: 'TARGET2', check: 'String' },
      { type: 'field_input', name: 'OBJ2', text: 'counter' },
      { type: 'input_statement', name: 'RUN', check: 'Command' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.execute,
  },
  {
    type: 'mc_execute_if_score_matches',
    message0: 'execute %1 score %2 objective %3 matches %4 run %5',
    args0: [
      {
        type: 'field_dropdown',
        name: 'INVERT',
        options: [['if', 'if'], ['unless', 'unless']],
      },
      { type: 'input_value', name: 'TARGET', check: 'String' },
      { type: 'field_input', name: 'OBJECTIVE', text: 'counter' },
      { type: 'field_input', name: 'RANGE', text: '1..5' },
      { type: 'input_statement', name: 'RUN', check: 'Command' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.execute,
    tooltip: 'Range examples: 5, 1..5, ..5, 5..',
  },
  {
    type: 'mc_execute_if_block',
    message0: 'execute %1 block at %2 is %3 run %4',
    args0: [
      {
        type: 'field_dropdown',
        name: 'INVERT',
        options: [['if', 'if'], ['unless', 'unless']],
      },
      { type: 'input_value', name: 'POS', check: 'String' },
      { type: 'field_input', name: 'BLOCK', text: 'minecraft:air' },
      { type: 'input_statement', name: 'RUN', check: 'Command' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.execute,
  },
  {
    type: 'mc_execute_custom',
    message0: 'execute %1 run %2',
    args0: [
      { type: 'field_input', name: 'SUBCOMMANDS', text: 'as @a at @s' },
      { type: 'input_statement', name: 'RUN', check: 'Command' },
    ],
    previousStatement: 'Command',
    nextStatement: 'Command',
    colour: COLOUR.execute,
    tooltip:
      'Advanced: type any chain of execute subcommands (as, at, if, ' +
      'positioned, align, rotated, facing, in, ...) without "execute" or "run".',
  },
];

Blockly.common.defineBlocksWithJsonArray(commandBlocks);
