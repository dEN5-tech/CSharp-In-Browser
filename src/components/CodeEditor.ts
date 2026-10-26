export class CodeEditor {
  private container: HTMLElement;
  private textarea: HTMLTextAreaElement;
  private lineNumbers: HTMLElement;
  private onChangeCallbacks: Set<(code: string) => void> = new Set();

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;

    this.container.innerHTML = `
      <div class="editor-wrapper">
        <div class="line-numbers" id="editor-line-numbers">1</div>
        <textarea 
          class="code-textarea" 
          id="editor-textarea" 
          spellcheck="false" 
          autocomplete="off" 
          autocorrect="off" 
          autocapitalize="off"
        ></textarea>
      </div>
    `;

    this.textarea = this.container.querySelector('#editor-textarea') as HTMLTextAreaElement;
    this.lineNumbers = this.container.querySelector('#editor-line-numbers') as HTMLElement;

    this.setupEvents();
  }

  private setupEvents(): void {
    // Sync line numbers on input and scroll
    this.textarea.addEventListener('input', () => {
      this.updateLineNumbers();
      this.notifyChange();
    });

    this.textarea.addEventListener('scroll', () => {
      this.lineNumbers.scrollTop = this.textarea.scrollTop;
    });

    // Handle Tab key for clean 4-space indentation
    this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const value = this.textarea.value;

        this.textarea.value = value.substring(0, start) + '    ' + value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 4;
        this.updateLineNumbers();
        this.notifyChange();
      }
    });
  }

  private updateLineNumbers(): void {
    const lineCount = (this.textarea.value.match(/\n/g) || []).length + 1;
    const nums: string[] = [];
    for (let i = 1; i <= lineCount; i++) {
      nums.push(i.toString());
    }
    this.lineNumbers.textContent = nums.join('\n');
  }

  private notifyChange(): void {
    const val = this.getValue();
    this.onChangeCallbacks.forEach((cb) => cb(val));
  }

  public onChange(cb: (code: string) => void): () => void {
    this.onChangeCallbacks.add(cb);
    return () => this.onChangeCallbacks.delete(cb);
  }

  public setValue(code: string): void {
    this.textarea.value = code;
    this.updateLineNumbers();
    this.notifyChange();
  }

  public getValue(): string {
    return this.textarea.value;
  }

  public focus(): void {
    this.textarea.focus();
  }
}
