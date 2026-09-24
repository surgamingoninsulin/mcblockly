import JSZip from 'jszip';
import * as Blockly from 'blockly/core';
import { generateFunctionText } from '../generators/mcfunction.js';

function functionFolderName(packFormat) {
  return packFormat >= 48 ? 'function' : 'functions';
}

/** Loads a serialized workspace state into a headless workspace so code can
 * be generated for a function that isn't the one currently shown on screen. */
function workspaceFromState(state) {
  const workspace = new Blockly.Workspace();
  if (state) {
    Blockly.serialization.workspaces.load(state, workspace, { recordUndo: false });
  }
  return workspace;
}

/** Builds a datapack zip Blob from the project state. */
export async function buildDatapackZip(project) {
  const zip = new JSZip();
  const { namespace, packFormat, description } = project;
  const folder = functionFolderName(packFormat);

  zip.file(
    'pack.mcmeta',
    JSON.stringify({ pack: { pack_format: packFormat, description } }, null, 2)
  );

  const fnDir = zip.folder('data').folder(namespace).folder(folder);
  const loadFns = [];
  const tickFns = [];

  for (const fn of project.functions) {
    const text = generateFunctionText(workspaceFromState(fn.workspaceState));
    fnDir.file(`${fn.name}.mcfunction`, text);
    if (fn.tags?.load) loadFns.push(`${namespace}:${fn.name}`);
    if (fn.tags?.tick) tickFns.push(`${namespace}:${fn.name}`);
  }

  if (loadFns.length || tickFns.length) {
    const tagsDir = zip.folder('data').folder('minecraft').folder('tags').folder(folder);
    if (loadFns.length) {
      tagsDir.file('load.json', JSON.stringify({ values: loadFns }, null, 2));
    }
    if (tickFns.length) {
      tagsDir.file('tick.json', JSON.stringify({ values: tickFns }, null, 2));
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

/** Builds a resource pack zip Blob from the project state. */
export async function buildResourcepackZip(project) {
  const zip = new JSZip();
  const { namespace, resourcePackFormat, description } = project;

  zip.file(
    'pack.mcmeta',
    JSON.stringify({ pack: { pack_format: resourcePackFormat, description } }, null, 2)
  );

  if (project.lang && project.lang.length) {
    const langJson = {};
    for (const entry of project.lang) {
      if (entry.key) langJson[entry.key] = entry.value ?? '';
    }
    zip
      .folder('assets')
      .folder(namespace)
      .folder('lang')
      .file('en_us.json', JSON.stringify(langJson, null, 2));
  }

  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
