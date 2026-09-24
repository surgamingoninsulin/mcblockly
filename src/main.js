import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import './blocks/values.js';
import './blocks/commands.js';
import { generateFunctionText } from './generators/mcfunction.js';
import { toolbox } from './toolbox.js';
import {
  newProject,
  saveToLocalStorage,
  loadFromLocalStorage,
  downloadProjectFile,
  readProjectFile,
} from './project.js';
import { buildDatapackZip, buildResourcepackZip, downloadBlob } from './export/datapack.js';

Blockly.setLocale(En);

let project = loadFromLocalStorage() || newProject();
let activeFunctionIndex = 0;

const workspace = Blockly.inject('blockly-div', {
  toolbox,
  grid: { spacing: 20, length: 3, colour: '#333', snap: true },
  zoom: { controls: true, wheel: true, startScale: 0.9 },
  trashcan: true,
});

// ------------------------------------------------------------- elements
const els = {
  namespace: document.getElementById('field-namespace'),
  description: document.getElementById('field-description'),
  packFormat: document.getElementById('field-pack-format'),
  resourcePackFormat: document.getElementById('field-resource-pack-format'),
  functionList: document.getElementById('function-list'),
  newFunctionName: document.getElementById('field-new-function'),
  addFunctionBtn: document.getElementById('btn-add-function'),
  renameFunctionBtn: document.getElementById('btn-rename-function'),
  deleteFunctionBtn: document.getElementById('btn-delete-function'),
  fnLoad: document.getElementById('field-fn-load'),
  fnTick: document.getElementById('field-fn-tick'),
  langTableBody: document.getElementById('lang-table-body'),
  addLangBtn: document.getElementById('btn-add-lang'),
  saveProjectBtn: document.getElementById('btn-save-project'),
  loadProjectBtn: document.getElementById('btn-load-project'),
  loadProjectInput: document.getElementById('input-load-project'),
  exportDatapackBtn: document.getElementById('btn-export-datapack'),
  exportResourcepackBtn: document.getElementById('btn-export-resourcepack'),
  previewCode: document.getElementById('preview-code'),
  previewFilename: document.getElementById('preview-filename'),
};

// --------------------------------------------------------- persistence
function persist() {
  saveToLocalStorage(project);
}

function syncActiveFunctionState() {
  const fn = project.functions[activeFunctionIndex];
  if (fn) fn.workspaceState = Blockly.serialization.workspaces.save(workspace);
}

function loadActiveFunctionIntoWorkspace() {
  const fn = project.functions[activeFunctionIndex];
  workspace.clear();
  if (fn && fn.workspaceState) {
    Blockly.serialization.workspaces.load(fn.workspaceState, workspace, { recordUndo: false });
  }
}

// ------------------------------------------------------------- render
function renderSettings() {
  els.namespace.value = project.namespace;
  els.description.value = project.description;
  els.packFormat.value = project.packFormat;
  els.resourcePackFormat.value = project.resourcePackFormat;
}

function renderFunctionList() {
  els.functionList.innerHTML = '';
  project.functions.forEach((fn, i) => {
    const li = document.createElement('li');
    li.className = i === activeFunctionIndex ? 'active' : '';
    const label = document.createElement('span');
    label.textContent = fn.name;
    li.appendChild(label);
    const badges = document.createElement('span');
    badges.className = 'badges';
    const tags = [];
    if (fn.tags?.load) tags.push('load');
    if (fn.tags?.tick) tags.push('tick');
    badges.textContent = tags.join(' ');
    li.appendChild(badges);
    li.addEventListener('click', () => switchToFunction(i));
    els.functionList.appendChild(li);
  });
  const fn = project.functions[activeFunctionIndex];
  els.fnLoad.checked = !!fn?.tags?.load;
  els.fnTick.checked = !!fn?.tags?.tick;
  els.previewFilename.textContent = `${fn?.name || 'main'}.mcfunction`;
}

function renderLangTable() {
  els.langTableBody.innerHTML = '';
  project.lang.forEach((entry, i) => {
    const tr = document.createElement('tr');

    const keyTd = document.createElement('td');
    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.value = entry.key;
    keyInput.placeholder = 'item.example.thing';
    keyInput.addEventListener('input', () => {
      entry.key = keyInput.value;
      persist();
    });
    keyTd.appendChild(keyInput);

    const valTd = document.createElement('td');
    const valInput = document.createElement('input');
    valInput.type = 'text';
    valInput.value = entry.value;
    valInput.placeholder = 'Thing';
    valInput.addEventListener('input', () => {
      entry.value = valInput.value;
      persist();
    });
    valTd.appendChild(valInput);

    const delTd = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.title = 'Remove entry';
    delBtn.addEventListener('click', () => {
      project.lang.splice(i, 1);
      renderLangTable();
      persist();
    });
    delTd.appendChild(delBtn);

    tr.append(keyTd, valTd, delTd);
    els.langTableBody.appendChild(tr);
  });
}

function renderPreview() {
  els.previewCode.textContent = generateFunctionText(workspace);
}

// ------------------------------------------------------------- actions
function switchToFunction(index) {
  if (index === activeFunctionIndex) return;
  syncActiveFunctionState();
  activeFunctionIndex = index;
  loadActiveFunctionIntoWorkspace();
  renderFunctionList();
  renderPreview();
  persist();
}

function sanitizeFunctionName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_.-]/g, '_');
}

els.addFunctionBtn.addEventListener('click', () => {
  const name = sanitizeFunctionName(els.newFunctionName.value);
  if (!name) return;
  if (project.functions.some((f) => f.name === name)) {
    alert(`A function named "${name}" already exists.`);
    return;
  }
  syncActiveFunctionState();
  project.functions.push({ name, workspaceState: null, tags: { load: false, tick: false } });
  activeFunctionIndex = project.functions.length - 1;
  els.newFunctionName.value = '';
  loadActiveFunctionIntoWorkspace();
  renderFunctionList();
  renderPreview();
  persist();
});

els.renameFunctionBtn.addEventListener('click', () => {
  const fn = project.functions[activeFunctionIndex];
  if (!fn) return;
  const next = prompt('Rename function', fn.name);
  if (!next) return;
  const name = sanitizeFunctionName(next);
  if (!name) return;
  if (project.functions.some((f, i) => f.name === name && i !== activeFunctionIndex)) {
    alert(`A function named "${name}" already exists.`);
    return;
  }
  fn.name = name;
  renderFunctionList();
  persist();
});

els.deleteFunctionBtn.addEventListener('click', () => {
  if (project.functions.length <= 1) {
    alert('A project needs at least one function.');
    return;
  }
  if (!confirm(`Delete function "${project.functions[activeFunctionIndex].name}"?`)) return;
  project.functions.splice(activeFunctionIndex, 1);
  activeFunctionIndex = Math.max(0, activeFunctionIndex - 1);
  loadActiveFunctionIntoWorkspace();
  renderFunctionList();
  renderPreview();
  persist();
});

els.fnLoad.addEventListener('change', () => {
  const fn = project.functions[activeFunctionIndex];
  fn.tags = fn.tags || {};
  fn.tags.load = els.fnLoad.checked;
  renderFunctionList();
  persist();
});

els.fnTick.addEventListener('change', () => {
  const fn = project.functions[activeFunctionIndex];
  fn.tags = fn.tags || {};
  fn.tags.tick = els.fnTick.checked;
  renderFunctionList();
  persist();
});

els.addLangBtn.addEventListener('click', () => {
  project.lang.push({ key: '', value: '' });
  renderLangTable();
  persist();
});

[els.namespace, els.description, els.packFormat, els.resourcePackFormat].forEach((el) => {
  el.addEventListener('input', () => {
    project.namespace = els.namespace.value.trim() || 'example';
    project.description = els.description.value;
    project.packFormat = parseInt(els.packFormat.value, 10) || 1;
    project.resourcePackFormat = parseInt(els.resourcePackFormat.value, 10) || 1;
    persist();
  });
});

els.saveProjectBtn.addEventListener('click', () => {
  syncActiveFunctionState();
  downloadProjectFile(project);
});

els.loadProjectBtn.addEventListener('click', () => els.loadProjectInput.click());

els.loadProjectInput.addEventListener('change', async () => {
  const file = els.loadProjectInput.files[0];
  if (!file) return;
  try {
    project = await readProjectFile(file);
    activeFunctionIndex = 0;
    renderSettings();
    loadActiveFunctionIntoWorkspace();
    renderFunctionList();
    renderLangTable();
    renderPreview();
    persist();
  } catch (e) {
    alert(`Could not load project: ${e.message}`);
  } finally {
    els.loadProjectInput.value = '';
  }
});

els.exportDatapackBtn.addEventListener('click', async () => {
  syncActiveFunctionState();
  const blob = await buildDatapackZip(project);
  downloadBlob(blob, `${project.namespace}-datapack.zip`);
});

els.exportResourcepackBtn.addEventListener('click', async () => {
  const blob = await buildResourcepackZip(project);
  downloadBlob(blob, `${project.namespace}-resourcepack.zip`);
});

workspace.addChangeListener((e) => {
  if (e.isUiEvent) return;
  renderPreview();
  syncActiveFunctionState();
  persist();
});

// -------------------------------------------------------------- init
renderSettings();
loadActiveFunctionIntoWorkspace();
renderFunctionList();
renderLangTable();
renderPreview();
