import * as Blockly from 'blockly/core';

// A custom Blockly code generator that turns a stack of command blocks into
// the plain-text lines of a .mcfunction file. Each command block's forBlock
// entry returns a single line (including its trailing newline); value
// blocks (target selector, position) return an [code, order] tuple like any
// other Blockly value block.

export const mcfunctionGenerator = new Blockly.Generator('MCFunction');

const ORDER_ATOMIC = 0;

mcfunctionGenerator.init = function (_workspace) {
  // Nothing to set up: no variable declarations or imports needed.
};

mcfunctionGenerator.finish = function (code) {
  return code;
};

mcfunctionGenerator.scrub_ = function (block, code, thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = !thisOnly && nextBlock ? mcfunctionGenerator.blockToCode(nextBlock) : '';
  return code + nextCode;
};

function target(block, generator, name, fallback) {
  return generator.valueToCode(block, name, ORDER_ATOMIC) || fallback;
}

// Runs exactly the first command found in a RUN statement input, warning if
// more than one was stacked there (Minecraft's `execute ... run` can only
// run a single command).
function runOne(block, generator, name) {
  const inner = block.getInputTargetBlock(name);
  if (!inner) {
    block.setWarningText('This "run" slot is empty.');
    return 'say missing command';
  }
  if (inner.nextConnection && inner.nextConnection.targetBlock()) {
    block.setWarningText(
      'Only the first command in "run" is used by Minecraft. Extra ' +
        'stacked blocks are ignored.'
    );
  } else {
    block.setWarningText(null);
  }
  const code = generator.blockToCode(inner, true);
  return (Array.isArray(code) ? code[0] : code).replace(/\n+$/, '');
}

const forBlock = mcfunctionGenerator.forBlock;

// ---------------------------------------------------------------- values
forBlock['mc_target_selector'] = function (block) {
  const base = block.getFieldValue('BASE');
  const args = block.getFieldValue('ARGS').trim();
  const code = args ? `${base}[${args}]` : base;
  return [code, ORDER_ATOMIC];
};

forBlock['mc_position'] = function (block) {
  const x = block.getFieldValue('X').trim() || '~';
  const y = block.getFieldValue('Y').trim() || '~';
  const z = block.getFieldValue('Z').trim() || '~';
  return [`${x} ${y} ${z}`, ORDER_ATOMIC];
};

// ---------------------------------------------------------------- misc
forBlock['mc_comment'] = (block) => `# ${block.getFieldValue('TEXT')}\n`;
forBlock['mc_raw_command'] = (block) => `${block.getFieldValue('TEXT')}\n`;

// ---------------------------------------------------------------- chat
forBlock['mc_say'] = (block) => `say ${block.getFieldValue('MESSAGE')}\n`;

forBlock['mc_tellraw'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@a');
  const msg = JSON.stringify({ text: block.getFieldValue('MESSAGE') });
  return `tellraw ${t} ${msg}\n`;
};

forBlock['mc_title'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@a');
  const action = block.getFieldValue('ACTION');
  if (action === 'clear' || action === 'reset') {
    return `title ${t} ${action}\n`;
  }
  const msg = JSON.stringify({ text: block.getFieldValue('MESSAGE') });
  return `title ${t} ${action} ${msg}\n`;
};

forBlock['mc_playsound'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@a');
  const pos = target(block, gen, 'POS', '');
  const sound = block.getFieldValue('SOUND');
  const source = block.getFieldValue('SOURCE');
  const volume = block.getFieldValue('VOLUME');
  const pitch = block.getFieldValue('PITCH');
  const posPart = pos ? ` ${pos} ${volume} ${pitch}` : '';
  return `playsound ${sound} ${source} ${t}${posPart}\n`;
};

// --------------------------------------------------------- items/mobs
forBlock['mc_give'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const item = block.getFieldValue('ITEM');
  const count = block.getFieldValue('COUNT');
  const extra = block.getFieldValue('EXTRA').trim();
  return `give ${t} ${item}${extra} ${count}\n`;
};

forBlock['mc_clear'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const item = block.getFieldValue('ITEM').trim();
  const count = block.getFieldValue('COUNT');
  const parts = [t];
  if (item) parts.push(item);
  if (item && count !== -1) parts.push(String(count));
  return `clear ${parts.join(' ')}\n`;
};

forBlock['mc_effect_give'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const effect = block.getFieldValue('EFFECT');
  const duration = block.getFieldValue('DURATION').trim() || '30';
  const amp = block.getFieldValue('AMPLIFIER');
  const hide = block.getFieldValue('HIDE') === 'TRUE';
  return `effect give ${t} ${effect} ${duration} ${amp}${hide ? ' true' : ''}\n`;
};

forBlock['mc_effect_clear'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const effect = block.getFieldValue('EFFECT').trim();
  return `effect clear ${t}${effect ? ' ' + effect : ''}\n`;
};

forBlock['mc_summon'] = (block, gen) => {
  const entity = block.getFieldValue('ENTITY');
  const pos = target(block, gen, 'POS', '~ ~ ~');
  const nbt = block.getFieldValue('NBT').trim();
  return `summon ${entity} ${pos}${nbt ? ' ' + nbt : ''}\n`;
};

forBlock['mc_kill'] = (block, gen) => `kill ${target(block, gen, 'TARGET', '@e')}\n`;

forBlock['mc_tp_to_pos'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const pos = target(block, gen, 'POS', '~ ~ ~');
  return `teleport ${t} ${pos}\n`;
};

forBlock['mc_tp_to_entity'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const dest = target(block, gen, 'DEST', '@p');
  return `teleport ${t} ${dest}\n`;
};

forBlock['mc_gamemode'] = (block, gen) => {
  const mode = block.getFieldValue('MODE');
  const t = target(block, gen, 'TARGET', '@s');
  return `gamemode ${mode} ${t}\n`;
};

forBlock['mc_xp_add'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const amount = block.getFieldValue('AMOUNT');
  const unit = block.getFieldValue('UNIT');
  return `xp add ${t} ${amount} ${unit}\n`;
};

// --------------------------------------------------------------- world
forBlock['mc_setblock'] = (block, gen) => {
  const pos = target(block, gen, 'POS', '~ ~ ~');
  const blockId = block.getFieldValue('BLOCK');
  const mode = block.getFieldValue('MODE');
  return `setblock ${pos} ${blockId} ${mode}\n`;
};

forBlock['mc_fill'] = (block, gen) => {
  const pos1 = target(block, gen, 'POS1', '~ ~ ~');
  const pos2 = target(block, gen, 'POS2', '~ ~ ~');
  const blockId = block.getFieldValue('BLOCK');
  const mode = block.getFieldValue('MODE');
  return `fill ${pos1} ${pos2} ${blockId} ${mode}\n`;
};

forBlock['mc_clone'] = (block, gen) => {
  const pos1 = target(block, gen, 'POS1', '~ ~ ~');
  const pos2 = target(block, gen, 'POS2', '~ ~ ~');
  const pos3 = target(block, gen, 'POS3', '~ ~ ~');
  return `clone ${pos1} ${pos2} ${pos3}\n`;
};

forBlock['mc_time_set'] = (block) => `time set ${block.getFieldValue('VALUE')}\n`;
forBlock['mc_time_add'] = (block) => `time add ${block.getFieldValue('AMOUNT')}\n`;

forBlock['mc_weather'] = (block) => {
  const type = block.getFieldValue('TYPE');
  const duration = block.getFieldValue('DURATION');
  return `weather ${type}${duration > 0 ? ' ' + duration : ''}\n`;
};

forBlock['mc_difficulty'] = (block) => `difficulty ${block.getFieldValue('LEVEL')}\n`;

// --------------------------------------------------------- scoreboard
forBlock['mc_scoreboard_obj_add'] = (block) => {
  const objective = block.getFieldValue('OBJECTIVE');
  const criteria = block.getFieldValue('CRITERIA');
  const display = block.getFieldValue('DISPLAY').trim();
  const displayPart = display ? ` ${JSON.stringify({ text: display })}` : '';
  return `scoreboard objectives add ${objective} ${criteria}${displayPart}\n`;
};

forBlock['mc_scoreboard_obj_remove'] = (block) =>
  `scoreboard objectives remove ${block.getFieldValue('OBJECTIVE')}\n`;

forBlock['mc_scoreboard_obj_display'] = (block) =>
  `scoreboard objectives setdisplay ${block.getFieldValue('SLOT')} ${block.getFieldValue('OBJECTIVE')}\n`;

forBlock['mc_scoreboard_players_set'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  return `scoreboard players set ${t} ${block.getFieldValue('OBJECTIVE')} ${block.getFieldValue('VALUE')}\n`;
};

forBlock['mc_scoreboard_players_add'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  return `scoreboard players add ${t} ${block.getFieldValue('OBJECTIVE')} ${block.getFieldValue('VALUE')}\n`;
};

forBlock['mc_scoreboard_players_remove'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  return `scoreboard players remove ${t} ${block.getFieldValue('OBJECTIVE')} ${block.getFieldValue('VALUE')}\n`;
};

forBlock['mc_scoreboard_players_reset'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const objective = block.getFieldValue('OBJECTIVE').trim();
  return `scoreboard players reset ${t}${objective ? ' ' + objective : ''}\n`;
};

forBlock['mc_scoreboard_players_op'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const source = target(block, gen, 'SOURCE', '@s');
  const op = block.getFieldValue('OP');
  return (
    `scoreboard players operation ${t} ${block.getFieldValue('OBJECTIVE')} ` +
    `${op} ${source} ${block.getFieldValue('SOURCE_OBJECTIVE')}\n`
  );
};

// ------------------------------------------------------ tags/functions
forBlock['mc_tag_add'] = (block, gen) =>
  `tag ${target(block, gen, 'TARGET', '@s')} add ${block.getFieldValue('TAG')}\n`;

forBlock['mc_tag_remove'] = (block, gen) =>
  `tag ${target(block, gen, 'TARGET', '@s')} remove ${block.getFieldValue('TAG')}\n`;

forBlock['mc_function_call'] = (block) => `function ${block.getFieldValue('FUNCTION')}\n`;

forBlock['mc_schedule_function'] = (block) => {
  const fn = block.getFieldValue('FUNCTION');
  const time = block.getFieldValue('TIME');
  const mode = block.getFieldValue('MODE');
  return `schedule function ${fn} ${time} ${mode}\n`;
};

forBlock['mc_schedule_clear'] = (block) => `schedule clear ${block.getFieldValue('FUNCTION')}\n`;

// ----------------------------------------------------- execute / flow
forBlock['mc_execute_as'] = (block, gen) => {
  const t = target(block, gen, 'TARGET', '@s');
  const atSelf = block.getFieldValue('AT_SELF') === 'TRUE';
  const run = runOne(block, gen, 'RUN');
  return `execute as ${t}${atSelf ? ' at @s' : ''} run ${run}\n`;
};

forBlock['mc_execute_positioned'] = (block, gen) => {
  const pos = target(block, gen, 'POS', '~ ~ ~');
  const run = runOne(block, gen, 'RUN');
  return `execute positioned ${pos} run ${run}\n`;
};

forBlock['mc_execute_if_score_compare'] = (block, gen) => {
  const invert = block.getFieldValue('INVERT');
  const t1 = target(block, gen, 'TARGET1', '@s');
  const t2 = target(block, gen, 'TARGET2', '@s');
  const op = block.getFieldValue('OP');
  const run = runOne(block, gen, 'RUN');
  return (
    `execute ${invert} score ${t1} ${block.getFieldValue('OBJ1')} ${op} ` +
    `${t2} ${block.getFieldValue('OBJ2')} run ${run}\n`
  );
};

forBlock['mc_execute_if_score_matches'] = (block, gen) => {
  const invert = block.getFieldValue('INVERT');
  const t = target(block, gen, 'TARGET', '@s');
  const run = runOne(block, gen, 'RUN');
  return (
    `execute ${invert} score ${t} ${block.getFieldValue('OBJECTIVE')} matches ` +
    `${block.getFieldValue('RANGE')} run ${run}\n`
  );
};

forBlock['mc_execute_if_block'] = (block, gen) => {
  const invert = block.getFieldValue('INVERT');
  const pos = target(block, gen, 'POS', '~ ~ ~');
  const run = runOne(block, gen, 'RUN');
  return `execute ${invert} block ${pos} ${block.getFieldValue('BLOCK')} run ${run}\n`;
};

forBlock['mc_execute_custom'] = (block, gen) => {
  const sub = block.getFieldValue('SUBCOMMANDS').trim();
  const run = runOne(block, gen, 'RUN');
  return `execute ${sub} run ${run}\n`;
};

/**
 * Generates the full text of a .mcfunction file from a workspace: every
 * top-level stack of command blocks is emitted in top-to-bottom (Y position)
 * order, blank line separated.
 */
export function generateFunctionText(workspace) {
  const topBlocks = workspace
    .getTopBlocks(false)
    .filter((b) => b.previousConnection === null || !b.previousConnection.targetConnection)
    .sort((a, b) => a.getRelativeToSurfaceXY().y - b.getRelativeToSurfaceXY().y);
  const stacks = topBlocks.map((b) => mcfunctionGenerator.blockToCode(b, false));
  const text = stacks
    .map((s) => (Array.isArray(s) ? s[0] : s))
    .join('')
    .replace(/\n{3,}/g, '\n\n');
  return text.endsWith('\n') || text === '' ? text : text + '\n';
}
