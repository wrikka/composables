# wcomposables

wcomposables is a comprehensive Vue composables library designed for the booking platform. Built with TypeScript and powered by VueUse, it provides a rich collection of reusable composition functions that streamline common development tasks. The library is organized into logical categories including browser utilities, core functions, data handling, UI helpers, and general utilities, making it easy to find and use the right composable for any situation.

## Features

- Browser utilities for DOM manipulation and browser APIs
- Core composables for fundamental functionality
- Data handling utilities for state management and data transformation
- UI helpers for common UI patterns and interactions
- General utilities for everyday development tasks
- Full TypeScript support with type safety
- Built on VueUse for proven and reliable utilities
- Comprehensive testing with Vitest
- Tree-shakeable for optimal bundle size
- Framework-agnostic - works with Vue 3 and Vue Router
- Hotkeys integration for keyboard shortcuts
- Markdown parsing with Turndown

## Goal

- Accelerate development with ready-to-use composables
- Provide type-safe and reliable utilities
- Reduce bundle size with tree-shaking
- Simplify common development patterns
- Deliver a polished developer experience
- Offer comprehensive documentation and examples
- Maintain high code quality with testing
- Enable easy integration with Vue projects

## Design Principles

- Composability - Each composable does one thing well
- Type Safety - Full TypeScript support for reliable code
- Performance - Optimized for minimal runtime overhead
- Tree-shakeable - Only include what you use
- Flexibility - Easy to customize and extend
- Documentation - Clear examples and usage guides
- Quality - Comprehensive testing ensures reliability
- Maintainability - Clean code structure for easy updates

## Installation

### From Workspace

```bash
bun install
```

### As a Dependency

```bash
bun add wcomposables
```

### From NPM

```bash
npm install wcomposables
```

### From Yarn

```bash
yarn add wcomposables
```

### From pnpm

```bash
pnpm add wcomposables
```

## Usage

### Development Mode

Start the development server with watch mode:

```bash
bun run dev
```

### Build Library

Build the composables library for distribution:

```bash
bun run build
```

### Run Tests

Execute unit tests:

```bash
bun run test
```

Run tests with UI:

```bash
bun run test:ui
```

Run tests once:

```bash
bun run test:run
```

### Lint Code

```bash
bun run lint
```

## Examples

### Using a Browser Composable

```vue
<template>
  <div>
    <p>Window size: {{ width }}x{{ height }}</p>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from 'wcomposables'

const { width, height } = useWindowSize()
</script>
```

### Using a Core Composable

```vue
<template>
  <div>
    <p>Counter: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup lang="ts">
import { useCounter } from 'wcomposables'

const { count, increment } = useCounter()
</script>
```

### Using a Data Composable

```vue
<template>
  <div>
    <p>Data: {{ data }}</p>
    <p>Loading: {{ loading }}</p>
  </div>
</template>

<script setup lang="ts">
import { useFetch } from 'wcomposables'

const { data, loading } = useFetch('https://api.example.com/data')
</script>
```

### Using a UI Composable

```vue
<template>
  <div>
    <p>Is dark mode: {{ isDark }}</p>
    <button @click="toggle">Toggle Theme</button>
  </div>
</template>

<script setup lang="ts">
import { useDarkMode } from 'wcomposables'

const { isDark, toggle } = useDarkMode()
</script>
```

### Using a Utility Composable

```vue
<template>
  <div>
    <input v-model="search" placeholder="Search..." />
    <p>Debounced: {{ debouncedSearch }}</p>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from 'wcomposables'

const search = ref('')
const debouncedSearch = useDebounceFn(search, 300)
</script>
```

## Development

### Run Scripts

```bash
bun run scripts
```

### Release

```bash
bun run release
```

This will use release-it to create a new release with conventional changelog.

### CLI Tool

The package includes a CLI tool:

```bash
wcomposables
```

## License

MIT License