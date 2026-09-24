// Toolbox definition. Shadow blocks pre-fill TARGET/POS inputs with
// sensible defaults so a block can be dragged out and used immediately.

function target(defaultBase = '@s', args = '') {
  return {
    shadow: {
      type: 'mc_target_selector',
      fields: { BASE: defaultBase, ARGS: args },
    },
  };
}

function pos(x = '~', y = '~', z = '~') {
  return {
    shadow: {
      type: 'mc_position',
      fields: { X: x, Y: y, Z: z },
    },
  };
}

function block(type, extraInputs = {}) {
  return { kind: 'block', type, inputs: extraInputs };
}

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Values',
      colour: '45',
      contents: [
        { kind: 'block', type: 'mc_target_selector' },
        { kind: 'block', type: 'mc_position' },
      ],
    },
    {
      kind: 'category',
      name: 'Chat & Display',
      colour: '200',
      contents: [
        block('mc_say'),
        block('mc_tellraw', { TARGET: target('@a') }),
        block('mc_title', { TARGET: target('@a') }),
        block('mc_playsound', { TARGET: target('@a'), POS: pos() }),
      ],
    },
    {
      kind: 'category',
      name: 'Items & Entities',
      colour: '140',
      contents: [
        block('mc_give', { TARGET: target('@p') }),
        block('mc_clear', { TARGET: target('@p') }),
        block('mc_effect_give', { TARGET: target('@p') }),
        block('mc_effect_clear', { TARGET: target('@p') }),
        block('mc_summon', { POS: pos() }),
        block('mc_kill', { TARGET: target('@e') }),
        block('mc_tp_to_pos', { TARGET: target('@s'), POS: pos() }),
        block('mc_tp_to_entity', { TARGET: target('@s'), DEST: target('@p') }),
        block('mc_gamemode', { TARGET: target('@s') }),
        block('mc_xp_add', { TARGET: target('@s') }),
      ],
    },
    {
      kind: 'category',
      name: 'World',
      colour: '100',
      contents: [
        block('mc_setblock', { POS: pos() }),
        block('mc_fill', { POS1: pos(), POS2: pos('~5', '~5', '~5') }),
        block('mc_clone', { POS1: pos(), POS2: pos('~5', '~5', '~5'), POS3: pos('~10') }),
        block('mc_time_set'),
        block('mc_time_add'),
        block('mc_weather'),
        block('mc_difficulty'),
      ],
    },
    {
      kind: 'category',
      name: 'Scoreboard',
      colour: '290',
      contents: [
        block('mc_scoreboard_obj_add'),
        block('mc_scoreboard_obj_remove'),
        block('mc_scoreboard_obj_display'),
        block('mc_scoreboard_players_set', { TARGET: target('@p') }),
        block('mc_scoreboard_players_add', { TARGET: target('@p') }),
        block('mc_scoreboard_players_remove', { TARGET: target('@p') }),
        block('mc_scoreboard_players_reset', { TARGET: target('@p') }),
        block('mc_scoreboard_players_op', { TARGET: target('@p'), SOURCE: target('@p') }),
      ],
    },
    {
      kind: 'category',
      name: 'Tags & Functions',
      colour: '225',
      contents: [
        block('mc_tag_add', { TARGET: target('@p') }),
        block('mc_tag_remove', { TARGET: target('@p') }),
        block('mc_function_call'),
        block('mc_schedule_function'),
        block('mc_schedule_clear'),
      ],
    },
    {
      kind: 'category',
      name: 'Execute & Flow',
      colour: '0',
      contents: [
        block('mc_execute_as', { TARGET: target('@a') }),
        block('mc_execute_positioned', { POS: pos() }),
        block('mc_execute_if_score_compare', { TARGET1: target('@p'), TARGET2: target('@p') }),
        block('mc_execute_if_score_matches', { TARGET: target('@p') }),
        block('mc_execute_if_block', { POS: pos() }),
        block('mc_execute_custom'),
      ],
    },
    {
      kind: 'category',
      name: 'Comments & Raw',
      colour: '0',
      contents: [block('mc_comment'), block('mc_raw_command')],
    },
  ],
};
