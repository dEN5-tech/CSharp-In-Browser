# C# In-Browser Academy (Vite + TypeScript + Roslyn WebAssembly)

A modern, production-grade educational playground and curriculum runner for executing C# code directly in the browser via **Mono WebAssembly** and in-browser **Microsoft Roslyn** compilation.

## Architecture

- **Wasm Runtime Engine**: Pure CIL bytecode execution inside browser memory via `dotnet.wasm` (1.83 MB Mono C VM) without any server-side compile backend.
- **In-Memory Roslyn Compiler**: AST parsing, type binding, and in-memory PE binary emission via `Microsoft.CodeAnalysis.CSharp.dll` (v2.10.0.0).
- **TypeScript Orchestration**: Promise-based asynchronous execution bridge (`WasmRuntimeService`) mapping C# `app.Invoke()` reflection calls to reactive observables.
- **Educational Curriculum**: 6 progressive stages covering Wasm runtime contracts, strong typing, LINQ queries, OOP domain modeling, high-speed JSON pipelines, and dynamic DOM rendering.

## Directory Structure

```
csharp-in-browser-edu/
├── public/
│   ├── dotnet.js            # Mono Emscripten runtime & BINDING interop
│   ├── dotnet.wasm          # Mono C Virtual Machine compiled to WebAssembly
│   ├── mono-config.js       # Manifest declaring BCL assemblies
│   └── managed/             # 59 Mono BCL DLLs + Roslyn DLLs + WasmRoslyn.dll
├── src/
│   ├── curriculum/
│   │   └── stages.ts        # 6 Interactive educational curriculum stages
│   ├── services/
│   │   └── WasmRuntimeService.ts # Strongly-typed singleton managing Wasm lifecycle
│   ├── components/
│   │   ├── CodeEditor.ts    # In-browser editor with line numbers & indentation
│   │   ├── StageNavigator.ts # Sidebar curriculum selector with objectives & hints
│   │   └── ConsoleOutput.ts # Multi-tab console (Output, Roslyn Diagnostics, Assemblies)
│   ├── types/
│   │   └── mono.ts          # Complete TypeScript type definitions
│   ├── main.ts              # UI orchestration & keyboard shortcuts (Ctrl+Enter)
│   └── style.css            # Dark developer theme styling
├── package.json             # Vite + TypeScript dependencies
├── tsconfig.json            # Strict TypeScript configuration
└── vite.config.ts           # Development & build configuration
```

## Quick Start

1. Start development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

2. Build for production:
   ```bash
   bun run build
   ```

3. Preview production build:
   ```bash
   bun run preview
   ```

## Educational Stages Included

1. **Stage 1: Hello Wasm & The Roslyn Contract** — Understanding in-browser CIL execution and the `public async Task<string> Run()` lifecycle.
2. **Stage 2: Strong Typing & Numerical Precision** — Value types, financial decimals, and memory layout in Wasm.
3. **Stage 3: Functional LINQ & Query Pipelines** — Declarative data transformations with `System.Linq` in WebAssembly.
4. **Stage 4: Object-Oriented Domain Architecture** — Interfaces, inheritance, and polymorphic telemetry.
5. **Stage 5: Async Pipelines & High-Speed JSON** — Serialization & deserialization with `Newtonsoft.Json` inside Wasm.
6. **Stage 6: Dynamic HTML Output & DOM Rendering** — Generating styled interactive UI cards and tables from C#.
