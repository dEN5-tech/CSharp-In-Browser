export interface MonoConfig {
  vfs_prefix: string;
  deploy_prefix: string;
  enable_debugging: number;
  file_list: string[];
}

export interface MonoBinding {
  call_static_method: (fqn: string, args: any[]) => any;
  resolve_method_fqn?: (fqn: string) => any;
  mono_wasm_object_registry?: Record<number, any>;
}

export interface MonoRuntimeGlobal {
  mono_load_runtime_and_bcl: (
    vfs_prefix: string,
    deploy_prefix: string,
    enable_debugging: number,
    file_list: string[],
    callback: () => void
  ) => void;
}

export interface EmscriptenModule {
  onRuntimeInitialized?: () => void;
  locateFile?: (path: string, prefix: string) => string;
  print?: (...args: any[]) => void;
  printErr?: (...args: any[]) => void;
  mono_bind_static_method?: (fqn: string) => (...args: any[]) => any;
}

declare global {
  interface Window {
    config: MonoConfig;
    BINDING: MonoBinding;
    MONO: MonoRuntimeGlobal;
    Module: EmscriptenModule;
    onWasmRuntimeReady?: () => void;
  }
}

export interface CompileDiagnostic {
  isSuccess: boolean;
  rawLog: string;
  durationMs: number;
}

export interface ExecutionResult {
  isSuccess: boolean;
  output: string;
  compileLog: string;
  durationMs: number;
  error?: string;
}

export interface EducationalStage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  category: 'Basics' | 'Data & Types' | 'LINQ' | 'OOP' | 'JSON & Async' | 'DOM Interop';
  summary: string;
  learningGoals: string[];
  starterCode: string;
  solutionCode: string;
  hints: string[];
  expectedOutputSnippet?: string;
}
