import './style.css';
import { WasmRuntimeService } from './services/WasmRuntimeService.ts';
import { CodeEditor } from './components/CodeEditor.ts';
import { StageNavigator } from './components/StageNavigator.ts';
import { ConsoleOutput } from './components/ConsoleOutput.ts';
import type { EducationalStage } from './types/mono.ts';

class Application {
  private runtimeService: WasmRuntimeService;
  private editor: CodeEditor;
  private navigator: StageNavigator;
  private consoleOutput: ConsoleOutput;

  private btnRun!: HTMLButtonElement;
  private btnCompile!: HTMLButtonElement;
  private btnReset!: HTMLButtonElement;
  private btnSolution!: HTMLButtonElement;
  private btnNext!: HTMLButtonElement;
  private statusText!: HTMLElement;
  private statusDot!: HTMLElement;

  constructor() {
    this.runtimeService = WasmRuntimeService.getInstance();
    this.editor = new CodeEditor('editor-container-mount');
    this.consoleOutput = new ConsoleOutput('console-container-mount');

    const navListEl = document.getElementById('stage-nav-mount')!;
    const detailsEl = document.getElementById('stage-details-mount')!;
    this.navigator = new StageNavigator(navListEl, detailsEl);

    this.bindDomElements();
    this.setupEvents();
    this.initRuntime();
  }

  private bindDomElements(): void {
    this.btnRun = document.getElementById('btn-run') as HTMLButtonElement;
    this.btnCompile = document.getElementById('btn-compile') as HTMLButtonElement;
    this.btnReset = document.getElementById('btn-reset-code') as HTMLButtonElement;
    this.btnSolution = document.getElementById('btn-show-solution') as HTMLButtonElement;
    this.btnNext = document.getElementById('btn-next-stage') as HTMLButtonElement;
    this.statusText = document.getElementById('runtime-status-text')!;
    this.statusDot = document.getElementById('runtime-status-dot')!;
  }

  private setupEvents(): void {
    // Stage selection sync
    this.navigator.onStageSelect((stage: EducationalStage) => {
      this.editor.setValue(stage.starterCode);
      this.consoleOutput.clear();
    });

    // Initial code load for Stage 1
    const initialStage = this.navigator.getCurrentStage();
    this.editor.setValue(initialStage.starterCode);

    // Toolbar buttons
    this.btnRun.addEventListener('click', () => this.handleRun());
    this.btnCompile.addEventListener('click', () => this.handleCompile());

    this.btnReset.addEventListener('click', () => {
      const stage = this.navigator.getCurrentStage();
      this.editor.setValue(stage.starterCode);
    });

    this.btnSolution.addEventListener('click', () => {
      const stage = this.navigator.getCurrentStage();
      this.editor.setValue(stage.solutionCode);
    });

    this.btnNext.addEventListener('click', () => {
      this.navigator.nextStage();
    });

    // Keyboard shortcuts: Ctrl+Enter (or Cmd+Enter) to run
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!this.btnRun.disabled) {
          this.handleRun();
        }
      }
    });

    // Subscriptions
    this.runtimeService.subscribeStatus((status, isReady) => {
      this.statusText.textContent = status;
      this.statusDot.classList.toggle('ready', isReady);

      this.btnRun.disabled = !isReady;
      this.btnCompile.disabled = !isReady;
    });

    this.runtimeService.subscribeAssemblies((assemblies) => {
      this.consoleOutput.setAssemblies(assemblies);
    });
  }

  private async initRuntime(): Promise<void> {
    try {
      await this.runtimeService.initialize();
    } catch (err: any) {
      console.error('Runtime boot error:', err);
      this.statusText.textContent = `Error: ${err.message || err}`;
    }
  }

  private async handleRun(): Promise<void> {
    if (!this.runtimeService.isRuntimeReady() || this.runtimeService.getIsCompiling()) return;

    const code = this.editor.getValue();
    this.setUiRunning(true);

    try {
      const result = await this.runtimeService.compileAndRun(code);
      this.consoleOutput.setCompileLog(result.compileLog);
      this.consoleOutput.setOutput(result.output, result.durationMs);

      // Validate against current stage objective
      const currentStage = this.navigator.getCurrentStage();
      if (
        result.isSuccess &&
        currentStage.expectedOutputSnippet &&
        result.output.includes(currentStage.expectedOutputSnippet)
      ) {
        this.navigator.markStageCompleted(currentStage.id);
      }
    } catch (err: any) {
      this.consoleOutput.setOutput(`Runtime Execution Error:\n${err.message || err}`);
    } finally {
      this.setUiRunning(false);
    }
  }

  private async handleCompile(): Promise<void> {
    if (!this.runtimeService.isRuntimeReady() || this.runtimeService.getIsCompiling()) return;

    const code = this.editor.getValue();
    this.setUiRunning(true);

    try {
      const diag = await this.runtimeService.compileOnly(code);
      this.consoleOutput.setCompileLog(diag.rawLog);
    } catch (err: any) {
      this.consoleOutput.setCompileLog(`Compiler Error:\n${err.message || err}`);
    } finally {
      this.setUiRunning(false);
    }
  }

  private setUiRunning(running: boolean): void {
    this.btnRun.disabled = running;
    this.btnCompile.disabled = running;
    if (running) {
      this.statusText.textContent = 'Roslyn Compiling & Executing in Wasm...';
    } else {
      this.statusText.textContent = 'C# In-Browser Runtime Ready';
    }
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new Application();
});
