const STORAGE_KEY = 'mcblockly-project-v1';
const PROJECT_VERSION = 1;

export function newProject() {
  return {
    version: PROJECT_VERSION,
    namespace: 'example',
    packFormat: 48,
    resourcePackFormat: 34,
    description: 'My datapack',
    functions: [
      { name: 'main', workspaceState: null, tags: { load: false, tick: false } },
    ],
    lang: [],
  };
}

export function saveToLocalStorage(project) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (e) {
    console.warn('Autosave failed', e);
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === PROJECT_VERSION) return parsed;
    return null;
  } catch (e) {
    console.warn('Reading autosave failed', e);
    return null;
  }
}

export function downloadProjectFile(project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.namespace || 'mcblockly'}-project.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readProjectFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.functions || !Array.isArray(parsed.functions)) {
          reject(new Error('Not a valid mcblockly project file.'));
          return;
        }
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
