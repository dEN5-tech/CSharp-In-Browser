import type { CompileDiagnostic, ExecutionResult } from '../types/mono.ts';

export type RuntimeStatusListener = (status: string, isReady: boolean) => void;
export type OutputListener = (output: string, compileLog: string) => void;
export type AssembliesListener = (assemblies: string[]) => void;

export class WasmRuntimeService {
  private static _instance: WasmRuntimeService;
  private isInitialized = false;
  private isCompiling = false;
  private loadedAssemblies: string[] = [];

  // Listeners
  private statusListeners: Set<RuntimeStatusListener> = new Set();
  private outputListeners: Set<OutputListener> = new Set();
  private assembliesListeners: Set<AssembliesListener> = new Set();

  // Pending execution promises
  private pendingRunResolve: ((res: ExecutionResult) => void) | null = null;
  private pendingCompileResolve: ((res: CompileDiagnostic) => void) | null = null;
  private currentCompileLog = '';
  private currentRunLog = '';
  private executionStartTime = 0;

  // Hidden DOM bridge element for C# Program.Main compatibility
  private dummyLogElement: HTMLElement;

  private constructor() {
    this.dummyLogElement = document.createElement('div');
    this.dummyLogElement.id = 'wasm-runtime-bridge-sink';
    this.dummyLogElement.style.display = 'none';
    document.body.appendChild(this.dummyLogElement);

    // Expose proxy methods globally or bind to this instance
    this.setCompileLog = this.setCompileLog.bind(this);
    this.setRunLog = this.setRunLog.bind(this);
    this.displayAssemblies = this.displayAssemblies.bind(this);
  }

  public static getInstance(): WasmRuntimeService {
    if (!WasmRuntimeService._instance) {
      WasmRuntimeService._instance = new WasmRuntimeService();
    }
    return WasmRuntimeService._instance;
  }

  public subscribeStatus(listener: RuntimeStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.isInitialized ? 'Runtime Ready' : 'Initializing...', this.isInitialized);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeOutput(listener: OutputListener): () => void {
    this.outputListeners.add(listener);
    return () => this.outputListeners.delete(listener);
  }

  public subscribeAssemblies(listener: AssembliesListener): () => void {
    this.assembliesListeners.add(listener);
    if (this.loadedAssemblies.length > 0) {
      listener(this.loadedAssemblies);
    }
    return () => this.assembliesListeners.delete(listener);
  }

  private notifyStatus(status: string, ready: boolean): void {
    this.statusListeners.forEach((fn) => fn(status, ready));
  }

  public getAssemblies(): string[] {
    return [...this.loadedAssemblies];
  }

  public isRuntimeReady(): boolean {
    return this.isInitialized;
  }

  public getIsCompiling(): boolean {
    return this.isCompiling;
  }

  /**
   * Initializes the Mono WebAssembly engine and BCL assemblies.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.notifyStatus('Fetching WebAssembly & BCL manifests...', false);

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!this.isInitialized) {
          reject(new Error('Mono WebAssembly runtime initialization timed out after 30 seconds.'));
        }
      }, 30000);

      const checkAndBoot = () => {
        if (typeof window.MONO !== 'undefined' && typeof window.config !== 'undefined') {
          this.notifyStatus('Loading Mono CIL Virtual Machine & 59 Assemblies...', false);

          window.MONO.mono_load_runtime_and_bcl(
            window.config.vfs_prefix,
            window.config.deploy_prefix,
            window.config.enable_debugging,
            window.config.file_list,
            () => {
              try {
                this.notifyStatus('Bootstrapping WasmRoslyn Host...', false);

                // Invoke C# entry point passing 'this' (JS proxy) and dummy element
                window.BINDING.call_static_method('[WasmRoslyn]WasmRoslyn.Program:Main', [
                  this,
                  this.dummyLogElement,
                ]);

                // Warm up Roslyn compiler with starter template to preload caches
                const warmUpStarter = `using System;
using System.Threading.Tasks;

namespace WasmRoslyn.Demo
{
    public class RunClass
    {
        public async Task<string> Run()
        {
            return "Wasm Roslyn Warm-up Complete";
        }
    }
}`;

                this.notifyStatus('Warming up Roslyn compiler caches...', false);
                this.compileOnlyInternal(warmUpStarter)
                  .then(() => {
                    this.isInitialized = true;
                    clearTimeout(timeoutId);
                    this.notifyStatus('C# In-Browser Runtime & Roslyn Ready', true);
                    resolve();
                  })
                  .catch((err) => {
                    console.warn('Warm-up warning:', err);
                    this.isInitialized = true;
                    clearTimeout(timeoutId);
                    this.notifyStatus('C# In-Browser Runtime Ready', true);
                    resolve();
                  });
              } catch (err) {
                clearTimeout(timeoutId);
                reject(err);
              }
            }
          );
        } else {
          setTimeout(checkAndBoot, 50);
        }
      };

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        checkAndBoot();
      } else {
        window.addEventListener('DOMContentLoaded', checkAndBoot);
      }
    });
  }

  /**
   * C# Proxy Callback: Receives referenced assemblies list from CompileService.Init()
   */
  public displayAssemblies(assemblies: string[]): void {
    this.loadedAssemblies = [...assemblies].sort();
    this.assembliesListeners.forEach((fn) => fn(this.loadedAssemblies));
  }

  /**
   * C# Proxy Callback: Receives compilation diagnostics log
   */
  public setCompileLog(log: string): void {
    this.currentCompileLog = log;
    this.isCompiling = false;

    const isSuccess = log.includes('Compilation success');
    const duration = performance.now() - this.executionStartTime;

    if (this.pendingCompileResolve) {
      this.pendingCompileResolve({
        isSuccess,
        rawLog: log,
        durationMs: Math.round(duration),
      });
      this.pendingCompileResolve = null;
    }
  }

  /**
   * C# Proxy Callback: Receives reflection execution string return value
   */
  public setRunLog(log: string): void {
    this.currentRunLog = log;
    this.isCompiling = false;

    const duration = performance.now() - this.executionStartTime;
    const isSuccess = this.currentCompileLog.includes('Compilation success');

    this.outputListeners.forEach((fn) => fn(this.currentRunLog, this.currentCompileLog));

    if (this.pendingRunResolve) {
      this.pendingRunResolve({
        isSuccess,
        output: log,
        compileLog: this.currentCompileLog,
        durationMs: Math.round(duration),
      });
      this.pendingRunResolve = null;
    }
  }

  /**
   * Adapts standard Visual Studio Console Application code (static void Main)
   * by prepending a Roslyn-compatible ConsoleHarness with Console.Out redirection.
   */
  private adaptCodeForExecution(userCode: string): string {
    // If the user already wrote a legacy RunClass with Task<string> Run(), leave it intact
    if (userCode.includes('public class RunClass') && userCode.includes('Task<string> Run()')) {
      return userCode;
    }

    // Prepend the Visual Studio Console Application bridge harness
    const vsHarness = `namespace VisualStudioRunner
{
    public class ConsoleHarness
    {
        public async System.Threading.Tasks.Task<string> Run()
        {
            using (var writer = new System.IO.StringWriter())
            {
                var originalOut = System.Console.Out;
                System.Console.SetOut(writer);
                try
                {
                    var asm = this.GetType().Assembly;
                    bool mainFound = false;
                    foreach (var t in asm.GetTypes())
                    {
                        if (t != this.GetType())
                        {
                            var main = t.GetMethod("Main", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
                            if (main != null)
                            {
                                mainFound = true;
                                var parameters = main.GetParameters();
                                object result = null;
                                if (parameters.Length == 0)
                                {
                                    result = main.Invoke(null, null);
                                }
                                else if (parameters.Length == 1 && parameters[0].ParameterType == typeof(string[]))
                                {
                                    result = main.Invoke(null, new object[] { new string[0] });
                                }

                                if (result is System.Threading.Tasks.Task task)
                                {
                                    await task;
                                }
                                break;
                            }
                        }
                    }

                    if (!mainFound)
                    {
                        writer.WriteLine("[Visual Studio Runner Error]: Could not find 'static void Main(string[] args)' or 'static void Main()' entry point.");
                    }
                }
                catch (System.Reflection.TargetInvocationException tie)
                {
                    writer.WriteLine("Unhandled Exception: " + tie.InnerException?.Message);
                    if (tie.InnerException?.StackTrace != null)
                    {
                        writer.WriteLine(tie.InnerException.StackTrace);
                    }
                }
                catch (System.Exception ex)
                {
                    writer.WriteLine("Unhandled Exception: " + ex.Message);
                    if (ex.StackTrace != null)
                    {
                        writer.WriteLine(ex.StackTrace);
                    }
                }
                finally
                {
                    System.Console.SetOut(originalOut);
                }

                string output = writer.ToString();
                return string.IsNullOrEmpty(output) ? "[Program completed with no output (exit code 0)]" : output;
            }
        }
    }
}
#line 1 "Program.cs"
`;

    return vsHarness + userCode;
  }

  /**
   * Compiles and executes C# code inside WebAssembly.
   */
  public async compileAndRun(code: string): Promise<ExecutionResult> {
    if (!this.isInitialized) {
      throw new Error('Runtime is not initialized yet.');
    }
    if (this.isCompiling) {
      throw new Error('Another compilation is currently in progress.');
    }

    this.isCompiling = true;
    this.currentCompileLog = '';
    this.currentRunLog = '';
    this.executionStartTime = performance.now();

    const adaptedCode = this.adaptCodeForExecution(code);

    return new Promise<ExecutionResult>((resolve, reject) => {
      this.pendingRunResolve = resolve;

      try {
        window.BINDING.call_static_method('[WasmRoslyn]WasmRoslyn.Program:Run', [this, adaptedCode]);
      } catch (err) {
        this.isCompiling = false;
        this.pendingRunResolve = null;
        reject(err);
      }
    });
  }

  /**
   * Compiles C# code without executing the Run method.
   */
  public async compileOnly(code: string): Promise<CompileDiagnostic> {
    if (!this.isInitialized) {
      throw new Error('Runtime is not initialized yet.');
    }
    const adaptedCode = this.adaptCodeForExecution(code);
    return this.compileOnlyInternal(adaptedCode);
  }

  private async compileOnlyInternal(code: string): Promise<CompileDiagnostic> {
    this.isCompiling = true;
    this.currentCompileLog = '';
    this.executionStartTime = performance.now();

    return new Promise<CompileDiagnostic>((resolve, reject) => {
      this.pendingCompileResolve = resolve;

      try {
        window.BINDING.call_static_method('[WasmRoslyn]WasmRoslyn.Program:CompileOnly', [this, code]);
      } catch (err) {
        this.isCompiling = false;
        this.pendingCompileResolve = null;
        reject(err);
      }
    });
  }
}
