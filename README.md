# MCBlockly

A Blockly-based visual editor for building Minecraft **datapacks** (and a bit
of **resource pack** content) in the browser — snap blocks together instead
of hand-typing `.mcfunction` command syntax.

Built with [Blockly](https://github.com/google/blockly) (the same block
engine used by Scratch and the RaspberryPiFoundation editors referenced in
the project brief).

## Features

- **Command blocks** for the most common `.mcfunction` commands: chat/`title`/
  `playsound`, `give`/`clear`/`effect`/`summon`/`kill`/`teleport`/`gamemode`/
  `xp`, `setblock`/`fill`/`clone`/`time`/`weather`/`difficulty`, full
  `scoreboard` objective & player management, `tag`, `function`/`schedule`,
  and an `execute` family (`as`, `positioned`, `if/unless score`,
  `if/unless block`, plus a raw "custom subcommands" escape hatch).
- Reusable **target selector** and **position** value blocks that plug into
  any command needing an entity target or coordinates.
- A **comment** block and a **raw command** block so anything not covered by
  a dedicated block can still be typed directly.
- Multiple named **functions**, each its own block workspace, with
  checkboxes to register a function on `#minecraft:load` / `#minecraft:tick`.
- Live **.mcfunction preview** of the function currently open.
- **Export Datapack** → a ready-to-drop-in `.zip` (`pack.mcmeta`,
  `data/<namespace>/function/*.mcfunction`, load/tick function tags).
- **Export Resource Pack** → a `.zip` with `pack.mcmeta` and a generated
  `assets/<namespace>/lang/en_us.json` from the language-entry table.
- **Save/Load Project** as a portable `.json` file, plus autosave to
  `localStorage` so a page reload doesn't lose work.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build into dist/
npm run preview   # preview the production build
```

## Project layout

```
src/
  blocks/        Blockly block definitions (values + commands)
  generators/    Custom "MCFunction" Blockly code generator
  export/        JSZip-based datapack/resourcepack builders
  toolbox.js     Categorized toolbox with shadow-block defaults
  project.js     Save/Load/autosave of the whole project
  main.js        App wiring: sidebar, tabs, preview, buttons
```

## Notes & limitations

- The datapack `function` vs `functions` folder name is picked from the pack
  format you enter (`>= 48` uses the newer `function` singular folder). Set
  the pack format to match the Minecraft version you're targeting if you're
  not sure.
- `execute ... run` blocks only run the **first** command placed in their
  "run" slot (that's how Minecraft's `execute` works) — a warning icon
  appears on the block if you stack more than one.
- Resource pack support currently covers `pack.mcmeta` and a language file
  builder; textures/models/sounds still need to be added to the exported zip
  by hand for now.
