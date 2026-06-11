# JSON Generator

A VSCode extension and companion npm package for generating nested sample JSON data from custom templates. Published to the VSCode Marketplace and the npm registry, so it works both as an in-editor command and as a programmatic library.

## Tech Stack

TypeScript · VSCode Extension API · Webpack · npm

---

## What it Does

Developers write a template describing the shape and constraints of the data they want, and the tool generates a matching JSON document with realistic random values. Templates support nested objects, arrays with configurable lengths, UUIDs, names, numbers with min/max ranges, and other common data patterns. The generator is exposed in two ways: as a VSCode command that reads the active editor's content and opens the generated output in a new editor pane, and as an npm package for use in scripts, tests, or other tools.

---

## Structure

The project is a small monorepo with two packages sharing the same core generation engine:

- `json-generator-vscode-extension/` — The VS Code extension. Registers a command in the command palette, reads the template from the active text editor, runs it through the generator, and writes the output to a new document. Bundled with Webpack and distributed as a VSIX via `vsce`.
- `generator-packages/npm/` — The standalone npm package. Exposes the same generation logic with a programmatic API and a CLI interface.

---

## How the Generator Works

Templates use a `{{pattern}}` syntax for placeholders. The generator recursively walks the template structure, matching each placeholder against a registry of generator functions. Arrays trigger recursive generation of the specified count of child objects. The parser handles arbitrary nesting depth.

The template DSL is intentionally simple — it stays within valid JSON structure so editors provide syntax highlighting out of the box, and the `{{...}}` markers are just strings that happen to encode generation instructions.
