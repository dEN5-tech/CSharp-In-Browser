declare const require: any;
declare const monaco: any;

export class CodeEditor {
  private container: HTMLElement;
  private editorInstance: any = null;
  private initialValue: string = '';
  private isMonacoReady = false;
  private onChangeCallbacks: Set<(code: string) => void> = new Set();
  private pendingSetValue: string | null = null;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);
    this.container = el;

    // Loading indicator while Monaco loads
    this.container.innerHTML = `
      <div id="monaco-host-element" style="width: 100%; height: 100%;"></div>
    `;

    this.initMonaco();
  }

  private initMonaco(): void {
    const hostEl = this.container.querySelector('#monaco-host-element') as HTMLElement;

    const waitForRequire = () => {
      if (typeof require !== 'undefined') {
        require.config({ paths: { vs: './vs' } });
        require(['vs/editor/editor.main'], () => {
          this.setupCsharpLanguageFeatures();
          this.createEditorInstance(hostEl);
        });
      } else {
        setTimeout(waitForRequire, 50);
      }
    };

    waitForRequire();
  }

  private createEditorInstance(hostEl: HTMLElement): void {
    this.editorInstance = monaco.editor.create(hostEl, {
      value: this.pendingSetValue ?? this.initialValue,
      language: 'csharp',
      theme: 'vs-dark',
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      autoIndent: 'full', // Smart C# Indentation
      formatOnType: true,
      formatOnPaste: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      quickSuggestions: { other: true, comments: false, strings: true },
      suggestOnTriggerCharacters: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      matchBrackets: 'always'
    });

    this.isMonacoReady = true;

    this.editorInstance.onDidChangeModelContent(() => {
      const val = this.editorInstance.getValue();
      this.onChangeCallbacks.forEach((cb) => cb(val));
    });

    if (this.pendingSetValue !== null) {
      this.editorInstance.setValue(this.pendingSetValue);
      this.pendingSetValue = null;
    }
  }

  /**
   * Registers C# Autocomplete, Snippets, and IntelliSense in Monaco
   */
  private setupCsharpLanguageFeatures(): void {
    if (!monaco.languages) return;

    // Register C# Completion Items & Snippets Provider
    monaco.languages.registerCompletionItemProvider('csharp', {
      triggerCharacters: ['.', ' ', '<', '(', '{'],
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          // --- Snippets ---
          {
            label: 'cw',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Console.WriteLine(...) snippet',
            insertText: 'Console.WriteLine(${1});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'cr',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Console.ReadLine() snippet',
            insertText: 'Console.ReadLine();',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'svm',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'static void Main entry point snippet',
            insertText: 'static void Main(string[] args)\n{\n    ${1}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'asyncmain',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'static async Task Main entry point snippet',
            insertText: 'static async Task Main(string[] args)\n{\n    ${1}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'prop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Auto-implemented Property snippet',
            insertText: 'public ${1:int} ${2:MyProperty} { get; set; }',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'foreach',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'foreach loop snippet',
            insertText: 'foreach (var ${1:item} in ${2:collection})\n{\n    ${3}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'for loop snippet',
            insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:count}; ${1:i}++)\n{\n    ${3}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'try',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'try catch block snippet',
            insertText: 'try\n{\n    ${1}\n}\ncatch (Exception ex)\n{\n    Console.WriteLine(ex.Message);\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'class declaration snippet',
            insertText: 'class ${1:ClassName}\n{\n    ${2}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'interface',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'interface declaration snippet',
            insertText: 'public interface ${1:IMyInterface}\n{\n    ${2}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },

          // --- Console & BCL Classes ---
          {
            label: 'Console.WriteLine',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Writes the specified data, followed by the current line terminator, to the standard output stream.',
            insertText: 'Console.WriteLine(${1});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'Console.Write',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Writes the specified data to the standard output stream without a trailing newline.',
            insertText: 'Console.Write(${1});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'Console',
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: 'Represents the standard input, output, and error streams for console applications.',
            insertText: 'Console',
            range,
          },
          {
            label: 'Math.Round',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Rounds a value to the nearest integer or to the specified number of fractional digits.',
            insertText: 'Math.Round(${1:val}, ${2:2})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'Math',
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: 'Provides constants and static methods for trigonometric, logarithmic, and other common mathematical functions.',
            insertText: 'Math',
            range,
          },
          {
            label: 'DateTime.Now',
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: 'Gets a DateTime object set to the current date and time on this computer, expressed as local time.',
            insertText: 'DateTime.Now',
            range,
          },
          {
            label: 'DateTime.UtcNow',
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: 'Gets a DateTime object set to the current date and time on this computer, expressed as Coordinated Universal Time (UTC).',
            insertText: 'DateTime.UtcNow',
            range,
          },
          {
            label: 'string.Join',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Concatenates the members of a collection or array elements, using the specified separator between each member.',
            insertText: 'string.Join("${1:\\n}", ${2:collection})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'string.IsNullOrEmpty',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Indicates whether the specified string is null or an empty string ("").',
            insertText: 'string.IsNullOrEmpty(${1})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'List<T>',
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: 'Represents a strongly typed list of objects that can be accessed by index.',
            insertText: 'List<${1:string}> ${2:list} = new List<${1:string}>();',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'Dictionary<TKey, TValue>',
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: 'Represents a collection of keys and values.',
            insertText: 'Dictionary<${1:string}, ${2:object}> ${3:dict} = new Dictionary<${1:string}, ${2:object}>();',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'Task.WhenAll',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Creates a task that will complete when all supplied tasks have completed.',
            insertText: 'await Task.WhenAll(${1:task1}, ${2:task2});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'Task.Delay',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Creates a task that completes after a specified number of milliseconds.',
            insertText: 'await Task.Delay(${1:1000});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },

          // --- LINQ Methods ---
          {
            label: 'Where',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Filters a sequence of values based on a predicate.',
            insertText: 'Where(${1:x} => ${2:condition})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'Select',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Projects each element of a sequence into a new form.',
            insertText: 'Select(${1:x} => ${2:projection})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'OrderBy',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Sorts the elements of a sequence in ascending order according to a key.',
            insertText: 'OrderBy(${1:x} => ${2:x.Property})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'OrderByDescending',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Sorts the elements of a sequence in descending order according to a key.',
            insertText: 'OrderByDescending(${1:x} => ${2:x.Property})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'ToList',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Creates a List<T> from an IEnumerable<T>.',
            insertText: 'ToList()',
            range,
          },
          {
            label: 'Average',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Computes the average of a sequence of numeric values.',
            insertText: 'Average(${1:x} => ${2:x.Property})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'Count',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Returns the number of elements in a sequence.',
            insertText: 'Count()',
            range,
          },
          {
            label: 'Sum',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Computes the sum of a sequence of numeric values.',
            insertText: 'Sum(${1:x} => ${2:x.Property})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },

          // --- ADO.NET ---
          {
            label: 'DataTable',
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: 'Represents one table of in-memory data in ADO.NET.',
            insertText: 'DataTable ${1:table} = new DataTable("${2:TableName}");',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'DataColumn',
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: 'Represents the schema of a column in a DataTable.',
            insertText: 'DataColumn',
            range,
          },
          {
            label: 'DataRow',
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: 'Represents a row of data in a DataTable.',
            insertText: 'DataRow',
            range,
          },
          {
            label: 'DataView',
            kind: monaco.languages.CompletionItemKind.Class,
            documentation: 'Represents a customized view of a DataTable for sorting, filtering, searching, and navigation.',
            insertText: 'DataView ${1:view} = new DataView(${2:table});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },

          // --- Newtonsoft.Json ---
          {
            label: 'JsonConvert.SerializeObject',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Serializes the specified object to a JSON string.',
            insertText: 'JsonConvert.SerializeObject(${1:obj}, Formatting.Indented)',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },
          {
            label: 'JsonConvert.DeserializeObject',
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: 'Deserializes the JSON to the specified .NET type.',
            insertText: 'JsonConvert.DeserializeObject<${1:Type}>(${2:json})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          },

          // --- Keywords ---
          ...[
            'using', 'namespace', 'class', 'struct', 'interface', 'enum',
            'public', 'private', 'protected', 'internal', 'static', 'async', 'await',
            'void', 'string', 'int', 'decimal', 'double', 'bool', 'var', 'new', 'return',
            'if', 'else', 'switch', 'case', 'break', 'continue', 'throw', 'try', 'catch', 'finally'
          ].map((kw) => ({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          })),
        ];

        return { suggestions };
      },
    });
  }

  public onChange(cb: (code: string) => void): () => void {
    this.onChangeCallbacks.add(cb);
    return () => this.onChangeCallbacks.delete(cb);
  }

  public setValue(code: string): void {
    this.initialValue = code;
    if (this.isMonacoReady && this.editorInstance) {
      this.editorInstance.setValue(code);
    } else {
      this.pendingSetValue = code;
    }
  }

  public getValue(): string {
    if (this.isMonacoReady && this.editorInstance) {
      return this.editorInstance.getValue();
    }
    return this.pendingSetValue ?? this.initialValue;
  }

  public focus(): void {
    if (this.isMonacoReady && this.editorInstance) {
      this.editorInstance.focus();
    }
  }
}
