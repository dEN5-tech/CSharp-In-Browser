export class ConsoleOutput {
  private container: HTMLElement;
  private currentTab: 'output' | 'compile' | 'assemblies' = 'output';

  private outputContentEl!: HTMLElement;
  private compileLogContentEl!: HTMLElement;
  private assembliesListEl!: HTMLElement;
  private durationBadgeEl!: HTMLElement;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;

    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="console-panel">
        <div class="console-header">
          <div class="console-tabs">
            <button class="tab-btn active" data-tab="output">Output</button>
            <button class="tab-btn" data-tab="compile">Compiler Diagnostics</button>
            <button class="tab-btn" data-tab="assemblies">Assemblies (<span id="assemblies-count">0</span>)</button>
          </div>
          <div class="console-meta">
            <span class="duration-badge" id="execution-duration" style="display:none;">0 ms</span>
            <button class="clear-btn" id="btn-clear-console" title="Clear console">Clear</button>
          </div>
        </div>

        <div class="console-body">
          <div class="tab-content" id="tab-output-pane">
            <div class="output-render" id="output-content">
              <span class="placeholder-text">Ready to run. Click "Compile & Run" (Ctrl+Enter) to execute C# in your browser.</span>
            </div>
          </div>

          <div class="tab-content" id="tab-compile-pane" style="display:none;">
            <pre class="compile-log-pre" id="compile-log-content">No compiler diagnostics yet.</pre>
          </div>

          <div class="tab-content" id="tab-assemblies-pane" style="display:none;">
            <div class="assemblies-search-bar">
              <input type="text" id="assembly-filter" placeholder="Filter assemblies (e.g. Linq, Roslyn, System.Data)..." />
            </div>
            <div class="assemblies-list" id="assemblies-list-content">Loading assemblies...</div>
          </div>
        </div>
      </div>
    `;

    this.outputContentEl = this.container.querySelector('#output-content') as HTMLElement;
    this.compileLogContentEl = this.container.querySelector('#compile-log-content') as HTMLElement;
    this.assembliesListEl = this.container.querySelector('#assemblies-list-content') as HTMLElement;
    this.durationBadgeEl = this.container.querySelector('#execution-duration') as HTMLElement;

    this.setupEvents();
  }

  private setupEvents(): void {
    const tabs = this.container.querySelectorAll('.tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab') as 'output' | 'compile' | 'assemblies';
        this.switchTab(target);
      });
    });

    this.container.querySelector('#btn-clear-console')?.addEventListener('click', () => {
      this.clear();
    });

    const filterInput = this.container.querySelector('#assembly-filter') as HTMLInputElement;
    filterInput?.addEventListener('input', (e) => {
      const term = (e.target as HTMLInputElement).value.toLowerCase();
      this.filterAssemblies(term);
    });
  }

  private switchTab(tab: 'output' | 'compile' | 'assemblies'): void {
    this.currentTab = tab;
    const outputPane = this.container.querySelector('#tab-output-pane') as HTMLElement;
    const compilePane = this.container.querySelector('#tab-compile-pane') as HTMLElement;
    const assembliesPane = this.container.querySelector('#tab-assemblies-pane') as HTMLElement;

    outputPane.style.display = tab === 'output' ? 'block' : 'none';
    compilePane.style.display = tab === 'compile' ? 'block' : 'none';
    assembliesPane.style.display = tab === 'assemblies' ? 'block' : 'none';
  }

  public setOutput(output: string, durationMs?: number): void {
    if (durationMs !== undefined) {
      this.durationBadgeEl.textContent = `${durationMs} ms`;
      this.durationBadgeEl.style.display = 'inline-block';
    }

    // Determine if output is HTML or plain text
    const isHtml = /<[a-z][\s\S]*>/i.test(output);
    if (isHtml) {
      this.outputContentEl.innerHTML = output;
    } else {
      this.outputContentEl.textContent = output;
    }

    this.switchTab('output');
    const tabs = this.container.querySelectorAll('.tab-btn');
    tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === 'output'));
  }

  public setCompileLog(rawLog: string): void {
    const isSuccess = rawLog.includes('Compilation success');
    let formatted = rawLog;

    if (isSuccess) {
      this.compileLogContentEl.className = 'compile-log-pre success';
      formatted = `[Roslyn Success] — Assembly generated and loaded into AppDomain.\n\n${rawLog}`;
    } else {
      this.compileLogContentEl.className = 'compile-log-pre error';
      formatted = `[Roslyn Compilation Error]\n\n${rawLog}`;
      // Automatically switch to diagnostics if compilation failed
      this.switchTab('compile');
      const tabs = this.container.querySelectorAll('.tab-btn');
      tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-tab') === 'compile'));
    }

    this.compileLogContentEl.textContent = formatted;
  }

  public setAssemblies(assemblies: string[]): void {
    const countEl = this.container.querySelector('#assemblies-count');
    if (countEl) countEl.textContent = assemblies.length.toString();

    this.assembliesListEl.innerHTML = assemblies
      .map((name) => `<div class="assembly-pill" data-name="${name.toLowerCase()}">${name}</div>`)
      .join('');
  }

  private filterAssemblies(term: string): void {
    const pills = this.assembliesListEl.querySelectorAll('.assembly-pill');
    pills.forEach((p) => {
      const name = p.getAttribute('data-name') || '';
      (p as HTMLElement).style.display = name.includes(term) ? 'inline-block' : 'none';
    });
  }

  public clear(): void {
    this.outputContentEl.innerHTML = '<span class="placeholder-text">Console cleared.</span>';
    this.compileLogContentEl.textContent = 'No diagnostics.';
    this.durationBadgeEl.style.display = 'none';
  }

  public getActiveTab(): 'output' | 'compile' | 'assemblies' {
    return this.currentTab;
  }
}
