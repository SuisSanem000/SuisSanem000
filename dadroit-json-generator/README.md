# Dadroit JSON Generator

A powerful VSCode extension and npm package for generating nested sample JSON data using custom templates.

## Tech Stack

- **TypeScript** - Core language for extension and packages
- **VSCode Extension API** - Editor integration
- **Webpack** - Module bundling
- **npm** - Package distribution

## Purpose

This project provides developers with an easy-to-use tool for generating mock and sample JSON data directly within VSCode or via npm packages. It streamlines the testing and development workflow by allowing custom template-based generation of complex, nested data structures.

## Main Features

- Custom JSON template syntax
- Nested data structure generation
- Random data with configurable patterns
- VSCode command palette integration
- Syntax highlighting for templates
- Real-time preview of generated output
- npm package for programmatic use
- Published on VSCode Marketplace
- Support for arrays, objects, and primitives

## Complex Features - Technical Details

### 1. Template Parser and Generator Engine
Parses custom template syntax and generates JSON with random/patterned data.

**Technical Implementation:**
- Custom template DSL (Domain-Specific Language)
- Recursive parsing for nested structures
- Pattern matching for data types (numbers, strings, UUIDs, etc.)
- Context-aware generation (parent-child relationships)

**Example Template:**
```json
{
  "users": "{{array:10}}",
  "id": "{{uuid}}",
  "name": "{{name}}",
  "age": "{{number:18-65}}"
}
```

### 2. VSCode Extension API Integration
Deep integration with Visual Studio Code's extension ecosystem.

**Technical Implementation:**
```typescript
vscode.commands.registerCommand('Generate JSON', async () => {
    const template = vscode.window.activeTextEditor.document.getText();
    const generated = await generateJSON(template);
    // ... show in new editor
});
```

- Command palette registration
- Active editor text extraction
- New document creation for output
- Status bar integration for progress
- Configuration settings support

### 3. Webpack Bundling for Extension
Optimized build pipeline for VSCode extension distribution.

**Technical Implementation:**
- Webpack configuration for extension packaging
- Tree-shaking to reduce bundle size
- TypeScript compilation with type checking
- Source map generation for debugging
- VSIX package creation via `vsce`

### 4. Standalone npm Package
Reusable generator package for non-VSCode environments.

**Technical Implementation:**
- Separate package structure in `generator-packages/npm`
- Same core generation logic as extension
- CLI interface for terminal use
- Programmatic API for integration
- Published to npm registry

## System Design Approach

**Extension Architecture**
- Activation on command invocation
- Lazy loading for performance
- Separate extension host process
- IPC communication with VSCode

**Template DSL Design**
- Declarative syntax for data patterns
- Extensible with custom generators
- Type-safe template structure
- Error reporting with line numbers

**Monorepo Structure**
- `json-generator-vscode-extension/` - VSCode-specific code
- `generator-packages/npm/` - Standalone npm package
- Shared core logic between packages

**Plugin Pattern**
- Core engine
- Pluggable data generators (names, UUIDs, numbers, etc.)
- Custom generator registration

## Algorithms & Data Structures

**Data Structures:**

- **Abstract Syntax Tree (AST)** - Parsed template representation
  - Nodes for objects, arrays, primitives, generators
  - Tree traversal for generation

- **Generator Registry** - Map of pattern → generator function
  ```typescript
  generators: Map<string, (params) => any>
  ```

- **Context Stack** - For nested generation
  - Tracks parent objects during recursive generation
  - Enables relative references ($parent.id)

**Algorithms:**

- **Recursive Descent Parsing**
  ```typescript
  parseObject(tokens) {
      for(prop in object) {
          if (isArray) parseArray()
          if (isObject) parseObject() // recursion
          if (isGenerator) generateValue()
      }
  }
  ```

- **Pattern Matching**
  - Regex matching for template syntax
  - Extract generator name and parameters
  - `{{name}}` → extract "name", call nameGenerator()

- **Random Generation with Constraints**
  ```typescript
  generateNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
  }
  ```

- **Template Interpolation**
  - Replace template markers with generated values
  - Preserve JSON structure
  - Type coercion (string numbers, booleans, etc.)
