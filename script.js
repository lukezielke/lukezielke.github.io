/* ============================================================
   Luke Zielke — Terminal Portfolio  |  script.js
   ============================================================ */

'use strict';

class Terminal {
  constructor() {
    this.currentPath = '/home/lukezielke';
    this.user        = 'lukezielke';
    this.host        = 'portfolio';
    this.commandHistory  = [];
    this.historyIndex    = -1;
    this.isTyping        = false;

    /* ── Virtual File System ───────────────────────────────── */
    this.fileSystem = {
      '/': {
        type: 'directory',
        contents: {
          home: {
            type: 'directory',
            contents: {
              lukezielke: {
                type: 'directory',
                contents: {
                  projects: { type: 'directory', contents: {} }
                }
              }
            }
          },
          etc:  { type: 'directory', contents: {} },
          var:  { type: 'directory', contents: {} },
          usr:  { type: 'directory', contents: {} }
        }
      }
    };

    /* ── Command registry ──────────────────────────────────── */
    this.commands = {
      help:     this.help.bind(this),
      ls:       this.ls.bind(this),
      ll:       this.ll.bind(this),
      cd:       this.cd.bind(this),
      cat:      this.cat.bind(this),
      pwd:      this.pwd.bind(this),
      whoami:   this.whoami.bind(this),
      echo:     this.echo.bind(this),
      tree:     this.tree.bind(this),
      neofetch: this.neofetch.bind(this),
      banner:   this.banner.bind(this),
      date:     this.dateCmd.bind(this),
      open:     this.openLink.bind(this),
      clear:    this.clear.bind(this),
    };

    this.init();
  }

  /* ── Boot ────────────────────────────────────────────────── */
  async init() {
    await this.loadFiles();
    this.updatePrompt();
    this.setupEventListeners();
    this.showWelcome();
    this.focusInput();
  }

  /* ── File loading ────────────────────────────────────────── */
  async loadFiles() {
    const home     = this.homeDir();
    const projects = home.contents.projects;

    const textFiles = [
      { dir: home,     name: 'about.txt',   path: 'texts/about.txt'   },
      { dir: home,     name: 'skills.txt',  path: 'texts/skills.txt'  },
      { dir: home,     name: 'contact.txt', path: 'texts/contact.txt' },
    ];

    const projectFiles = [
      { dir: projects, name: 'navigator.txt',   path: 'texts/projects/navigator.txt' },
    ];

    const allFiles = [...textFiles, ...projectFiles];

    await Promise.all(allFiles.map(async (f) => {
      try {
        const res = await fetch(f.path);
        if (!res.ok) throw new Error(res.statusText);
        f.dir.contents[f.name] = { type: 'file', content: await res.text() };
      } catch {
        const fallback = this.fallbackContent(f.name);
        if (fallback) f.dir.contents[f.name] = { type: 'file', content: fallback };
      }
    }));
  }

  homeDir() {
    return this.fileSystem['/'].contents.home.contents.lukezielke;
  }

  fallbackContent(name) {
    const map = {
      'about.txt': `Hi! My name is Luke Zielke.
══════════════════════════

I am a Software Developer from Germany, currently pursuing
a B.Sc. in IT Systems Engineering at Hasso Plattner
Institute (HPI) in Potsdam.

I enjoy building things close to the metal — from systems
programming in C/C++ to cross-platform apps with Flutter,
and everything in between. My main areas of interest are
security, automation, and open-source development.

GitHub  →  https://github.com/lukezielke
Email   →  lukezielke@protonmail.com

Feel free to reach out — whether it's a job offer,
a collaboration, or just a good hacking idea.

Cheers, and keep on hacking!`,

      'skills.txt': `Languages
─────────
  Python        ████████████░░  expert
  C / C++       █████████░░░░░  advanced
  JavaScript    ████████░░░░░░  advanced
  Dart          ███████░░░░░░░  proficient
  HTML / CSS    ████████░░░░░░  advanced
  Bash          ██████░░░░░░░░  proficient
  SQL           ███████░░░░░░░  proficient

Frameworks & Tools
──────────────────
  Flutter   · cross-platform mobile & desktop apps
  FastAPI   · Python REST APIs
  Git       · version control & open-source workflow
  Linux     · daily driver (Arch btw)
  Docker    · containerisation & deployment

Interests
─────────
  Security        · CTFs, pentesting, vulnerability research
  Web Scraping    · data collection & automation
  Systems Prog.   · OS internals, low-level performance
  Open Source     · contribute & learn in public`,

      'contact.txt': `Contact
═══════

  Email     lukezielke@protonmail.com
  GitHub    https://github.com/lukezielke
  LinkedIn  https://www.linkedin.com/in/luke-zielke-581b60295/

Prefer email for technical enquiries.
Response time: usually within 48 hours.`,


      'navigator.txt': `Navigator
═════════
DB-Navigator like app built with Flutter & Dart.

Features
  · Better & more modern UI
  · Cross Platform
  · Works with all trains and busses in Germany

Status   work in progress
Stack    Flutter · Dart
Repo     https://github.com/41-61-72-6F-6E/Navigator`,
    };
    return map[name] || null;
  }

  /* ── Prompt ──────────────────────────────────────────────── */
  updatePrompt() {
    const short = this.currentPath.replace('/home/lukezielke', '~');
    document.getElementById('prompt').innerHTML =
      `<span class="user">${this.user}</span>` +
      `<span class="dim">@</span>` +
      `<span class="host">${this.host}</span>` +
      `<span class="dim">:</span>` +
      `<span class="path">${short}</span>` +
      `<span class="dollar"> $</span>`;
  }

  /* ── Welcome screen ──────────────────────────────────────── */
  showWelcome() {
    const art = this.asciiArt();
    const sub = [
      '',
      '  <span class="info">Software Developer</span>  ·  IT Systems Engineering @ HPI',
      '',
      `  Type <span class="success">help</span> to see available commands.`,
      `  Type <span class="success">neofetch</span> for a quick overview.`,
      '',
    ].join('\n');

    this.appendHTML(`<span class="ascii-banner">${art}</span>${sub}\n`);
  }

  asciiArt() {
    return [
      ' ██╗     ██╗   ██╗██╗  ██╗███████╗',
      ' ██║     ██║   ██║██║ ██╔╝██╔════╝',
      ' ██║     ██║   ██║█████╔╝ █████╗  ',
      ' ██║     ██║   ██║██╔═██╗ ██╔══╝  ',
      ' ███████╗╚██████╔╝██║  ██╗███████╗',
      ' ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝',
      '',
      ' ███████╗██╗███████╗██╗     ██╗  ██╗███████╗',
      ' ╚══███╔╝██║██╔════╝██║     ██║ ██╔╝██╔════╝',
      '   ███╔╝ ██║█████╗  ██║     █████╔╝ █████╗  ',
      '  ███╔╝  ██║██╔══╝  ██║     ██╔═██╗ ██╔══╝  ',
      ' ███████╗██║███████╗███████╗██║  ██╗███████╗',
      ' ╚══════╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝',
    ].join('\n');
  }

  /* ── Event listeners ─────────────────────────────────────── */
  setupEventListeners() {
    const input = document.getElementById('command-input');

    input.addEventListener('keydown', (e) => {
      if (this.isTyping && e.key !== 'c') return;

      switch (e.key) {
        case 'Enter':
          this.executeCommand(input.value.trim());
          input.value = '';
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.navigateHistory(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.navigateHistory(1);
          break;
        case 'Tab':
          e.preventDefault();
          this.autoComplete(input);
          break;
        case 'l':
          if (e.ctrlKey) { e.preventDefault(); this.clear([]); }
          break;
        case 'u':
          if (e.ctrlKey) { e.preventDefault(); input.value = ''; }
          break;
      }
    });

    /* Re-focus on click anywhere (desktop) */
    document.addEventListener('click',      () => this.focusInput());
    document.addEventListener('touchstart', () => this.focusInput(), { passive: true });
  }

  focusInput() {
    if (!this.isTyping) document.getElementById('command-input').focus();
  }

  /* ── History ─────────────────────────────────────────────── */
  navigateHistory(dir) {
    if (!this.commandHistory.length) return;
    this.historyIndex = Math.max(0, Math.min(
      this.commandHistory.length,
      this.historyIndex + dir
    ));
    const input = document.getElementById('command-input');
    input.value = this.commandHistory[this.historyIndex] ?? '';
  }

  /* ── Tab completion ──────────────────────────────────────── */
  autoComplete(input) {
    const parts = input.value.split(' ');
    const last  = parts[parts.length - 1];

    if (parts.length === 1) {
      const matches = Object.keys(this.commands).filter(c => c.startsWith(last));
      if (matches.length === 1) input.value = matches[0];
    } else {
      const dir = this.getCurrentDirectory();
      if (dir?.contents) {
        const matches = Object.keys(dir.contents).filter(n => n.startsWith(last));
        if (matches.length === 1) { parts[parts.length - 1] = matches[0]; input.value = parts.join(' '); }
      }
    }
  }

  /* ── Command execution ───────────────────────────────────── */
  executeCommand(line) {
    if (!line) return;

    this.commandHistory.push(line);
    this.historyIndex = this.commandHistory.length;

    const promptText = document.getElementById('prompt').textContent;
    this.appendHTML(
      `<span class="echo-line">` +
        `<span class="prompt-text">${this.escapeHtml(promptText)}</span>` +
        `<span class="echo">${this.escapeHtml(line)}</span>` +
      `</span>\n`
    );

    const [cmd, ...args] = this.parseArgs(line);

    if (this.commands[cmd]) {
      const result = this.commands[cmd](args);
      if (result !== undefined && result !== null) {
        this.appendOutput(result);
      }
    } else {
      const suggestion = this.suggest(cmd);
      this.appendOutput(
        `<span class="error">command not found: ${this.escapeHtml(cmd)}</span>` +
        (suggestion ? `\nDid you mean <span class="info">${suggestion}</span>?` : '')
      );
    }

    this.scrollToBottom();
  }

  parseArgs(line) {
    /* simple shell-like split respecting quoted strings */
    const result = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';
    for (const ch of line) {
      if (inQuote) {
        if (ch === quoteChar) inQuote = false;
        else current += ch;
      } else if (ch === '"' || ch === "'") {
        inQuote = true; quoteChar = ch;
      } else if (ch === ' ' && current) {
        result.push(current); current = '';
      } else if (ch !== ' ') {
        current += ch;
      }
    }
    if (current) result.push(current);
    return result;
  }

  suggest(cmd) {
    const keys  = Object.keys(this.commands);
    const close = keys.filter(k => this.editDistance(cmd, k) <= 2);
    return close[0] ?? null;
  }

  editDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (__, j) => i === 0 ? j : j === 0 ? i : 0)
    );
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        dp[i][j] = a[i-1] === b[j-1]
          ? dp[i-1][j-1]
          : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[a.length][b.length];
  }

  /* ── Output helpers ──────────────────────────────────────── */
  appendHTML(html) {
    const out = document.getElementById('output');
    out.insertAdjacentHTML('beforeend', html);
  }

  appendOutput(content) {
    this.appendHTML(`<span class="command-output">${content}</span>\n`);
  }

  scrollToBottom() {
    const out = document.getElementById('output');
    out.scrollTop = out.scrollHeight;
  }

  escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── File system helpers ─────────────────────────────────── */
  getCurrentDirectory() {
    return this.nodeAt(this.currentPath);
  }

  nodeAt(path) {
    const parts = path.split('/').filter(Boolean);
    let node = this.fileSystem['/'];
    for (const p of parts) {
      if (node?.contents?.[p]) node = node.contents[p];
      else return null;
    }
    return node;
  }

  resolvePath(input) {
    if (!input || input === '~')         return '/home/lukezielke';
    if (input.startsWith('~/'))          return '/home/lukezielke' + input.slice(1);
    if (input.startsWith('/'))           return this.normalisePath(input);
    if (input === '..')                  return this.parentOf(this.currentPath);
    if (input === '.')                   return this.currentPath;
    return this.normalisePath(this.currentPath + '/' + input);
  }

  parentOf(path) {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return '/' + parts.join('/');
  }

  normalisePath(path) {
    const parts = path.split('/').filter(Boolean);
    const stack = [];
    for (const p of parts) {
      if (p === '..')      stack.pop();
      else if (p !== '.') stack.push(p);
    }
    return '/' + stack.join('/');
  }

  /* ════════════════════════════════════════════════════════════
     COMMANDS
  ════════════════════════════════════════════════════════════ */

  help() {
    return [
      `<span class="help-section">NAVIGATION</span>`,
      this.helpRow('ls',       'list directory contents'),
      this.helpRow('ll',       'long listing (ls -l)'),
      this.helpRow('cd',       'change directory  (~ to go home)'),
      this.helpRow('pwd',      'print working directory'),
      this.helpRow('tree',     'tree view of current directory'),
      `<span class="help-section">FILES</span>`,
      this.helpRow('cat',      'display file contents'),
      `<span class="help-section">SYSTEM</span>`,
      this.helpRow('neofetch', 'system / profile overview'),
      this.helpRow('whoami',   'current user'),
      this.helpRow('date',     'current date and time'),
      this.helpRow('banner',   'show ASCII banner'),
      `<span class="help-section">MISC</span>`,
      this.helpRow('echo',     'print text'),
      this.helpRow('open',     'open a URL  (e.g. open contact.txt)'),
      this.helpRow('clear',    'clear the screen'),
      '',
      `<span class="dim">Shortcuts: ↑↓ history · Tab autocomplete · Ctrl+L clear · Ctrl+U erase line</span>`,
    ].join('\n');
  }

  helpRow(cmd, desc) {
    return `  <span class="help-cmd">${cmd.padEnd(10)}</span><span class="help-sep">–</span><span class="help-desc">${desc}</span>`;
  }

  /* ── ls ────────────────────────────────────────────────────── */
  ls(args) {
    const target = args[0] ? this.resolvePath(args[0]) : this.currentPath;
    const node   = this.nodeAt(target);
    if (!node)                            return `<span class="error">ls: ${this.escapeHtml(args[0] ?? '')}: No such file or directory</span>`;
    if (node.type !== 'directory')        return `<span class="file">${this.escapeHtml(args[0])}</span>`;
    if (!Object.keys(node.contents).length) return '';

    return Object.entries(node.contents)
      .map(([name, n]) =>
        n.type === 'directory'
          ? `<span class="directory">${name}/</span>`
          : `<span class="file">${name}</span>`
      ).join('  ');
  }

  /* ── ll ────────────────────────────────────────────────────── */
  ll(args) {
    const target = args[0] ? this.resolvePath(args[0]) : this.currentPath;
    const node   = this.nodeAt(target);
    if (!node || node.type !== 'directory') return this.ls(args);

    const entries = Object.entries(node.contents);
    if (!entries.length) return '<span class="dim">(empty)</span>';

    const rows = entries.map(([name, n]) => {
      const type  = n.type === 'directory' ? 'd' : '-';
      const perms = n.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--';
      const size  = n.type === 'file' ? String(n.content?.length ?? 0).padStart(6) : '     -';
      const label = n.type === 'directory'
        ? `<span class="directory">${name}/</span>`
        : `<span class="file">${name}</span>`;
      return `<span class="dim">${type}${perms}  lukezielke  ${size}</span>  ${label}`;
    });

    return `<span class="dim">total ${entries.length}</span>\n` + rows.join('\n');
  }

  /* ── cd ────────────────────────────────────────────────────── */
  cd(args) {
    const target = this.resolvePath(args[0]);
    const node   = this.nodeAt(target);
    if (!node)                     return `<span class="error">cd: ${this.escapeHtml(args[0] ?? '~')}: No such file or directory</span>`;
    if (node.type !== 'directory') return `<span class="error">cd: ${this.escapeHtml(args[0])}: Not a directory</span>`;
    this.currentPath = target;
    this.updatePrompt();
  }

  /* ── cat ───────────────────────────────────────────────────── */
  cat(args) {
    if (!args.length) return '<span class="error">cat: missing operand</span>';

    const results = args.map(arg => {
      const target = this.resolvePath(arg);
      const node   = this.nodeAt(target);
      if (!node)                     return `<span class="error">cat: ${this.escapeHtml(arg)}: No such file or directory</span>`;
      if (node.type === 'directory') return `<span class="error">cat: ${this.escapeHtml(arg)}: Is a directory</span>`;
      return this.renderFileContent(node.content);
    });

    return results.join('\n');
  }

  renderFileContent(raw) {
    /* Convert plain-text URLs to clickable links */
    const escaped = this.escapeHtml(raw);
    return escaped.replace(
      /(https?:\/\/[^\s<>"]+)/g,
      `<a href="$1" target="_blank" rel="noopener">$1</a>`
    );
  }

  /* ── pwd ───────────────────────────────────────────────────── */
  pwd() {
    return `<span class="path">${this.currentPath}</span>`;
  }

  /* ── whoami ────────────────────────────────────────────────── */
  whoami() {
    return `<span class="user">${this.user}</span>`;
  }

  /* ── echo ──────────────────────────────────────────────────── */
  echo(args) {
    return this.escapeHtml(args.join(' '));
  }

  /* ── tree ──────────────────────────────────────────────────── */
  tree(args) {
    const target = args[0] ? this.resolvePath(args[0]) : this.currentPath;
    const node   = this.nodeAt(target);
    if (!node)                     return `<span class="error">tree: ${this.escapeHtml(args[0] ?? '')}: No such file or directory</span>`;
    if (node.type !== 'directory') return `<span class="error">tree: not a directory</span>`;

    const label = `<span class="tree-dir">${target === this.currentPath ? '.' : this.escapeHtml(args[0])}</span>`;
    const lines = this.buildTree(node, '');
    return label + '\n' + lines.join('\n');
  }

  buildTree(dir, prefix) {
    const entries = Object.entries(dir.contents);
    const lines   = [];
    entries.forEach(([name, node], idx) => {
      const last      = idx === entries.length - 1;
      const connector = last ? '└── ' : '├── ';
      const childPfx  = last ? '    ' : '│   ';
      const label     = node.type === 'directory'
        ? `<span class="tree-dir">${name}/</span>`
        : `<span class="tree-file">${name}</span>`;
      lines.push(`<span class="tree-pipe">${prefix}${connector}</span>${label}`);
      if (node.type === 'directory') {
        lines.push(...this.buildTree(node, prefix + childPfx));
      }
    });
    return lines;
  }

  /* ── neofetch ──────────────────────────────────────────────── */
  neofetch() {
    const logo = [
      `<span style="color:#58a6ff">    .---.    </span>`,
      `<span style="color:#58a6ff">   /     \\   </span>`,
      `<span style="color:#79c0ff">   \\.@-@./   </span>`,
      `<span style="color:#79c0ff">   /\`\\_/\`\\   </span>`,
      `<span style="color:#a5d6ff">  //  _  \\\\  </span>`,
      `<span style="color:#a5d6ff"> | \\     )| </span>`,
      `<span style="color:#cae8ff">/\`\\_\`>  <_/\\ </span>`,
      `<span style="color:#cae8ff">\\__/\`---'\\__/</span>`,
    ].join('\n');

    const row = (label, value) =>
      `<span class="nf-label">${label}</span><span class="nf-sep">  </span><span class="nf-value">${value}</span>`;

    const info = [
      `<span style="color:#58a6ff;font-weight:700">lukezielke</span><span class="dim">@</span><span style="color:#3fb950;font-weight:700">portfolio</span>`,
      `<span class="dim">─────────────────────────</span>`,
      row('OS        ', 'Portfolio v2.0'),
      row('Host      ', 'GitHub Pages'),
      row('Shell     ', 'JavaScript (ES2023)'),
      row('Languages ', 'Python · C/C++ · JS · Dart'),
      row('Frameworks', 'Flutter · Git · Linux'),
      row('Interests ', 'Security · Scraping'),
      row('Study     ', 'IT Systems Eng. @ HPI'),
      row('Contact   ', '<a href="mailto:lukezielke@protonmail.com">lukezielke@protonmail.com</a>'),
      row('LinkedIn  ', '<a href="https://www.linkedin.com/in/luke-zielke-581b60295/" target="_blank" rel="noopener">Luke Zielke</a>'),
      `<span class="dim">─────────────────────────</span>`,
      this.colorSwatches(),
    ].join('\n');

    const logoLines = logo.split('\n');
    const infoLines = info.split('\n');
    const count = Math.max(logoLines.length, infoLines.length);
    const rows  = [];
    for (let i = 0; i < count; i++) {
      const l = logoLines[i] ?? '             ';
      const r = infoLines[i] ?? '';
      rows.push(`${l}  ${r}`);
    }
    return rows.join('\n');
  }

  colorSwatches() {
    const colors = ['#f85149','#3fb950','#e3b341','#58a6ff','#bc8cff','#39c5cf','#c9d1d9','#484f58'];
    return '<span class="nf-colors">' +
      colors.map(c => `<span style="background:${c}">&nbsp;&nbsp;</span>`).join('') +
      '</span>';
  }

  /* ── banner ────────────────────────────────────────────────── */
  banner() {
    return `<span class="ascii-banner">${this.asciiArt()}</span>`;
  }

  /* ── date ──────────────────────────────────────────────────── */
  dateCmd() {
    return `<span class="info">${new Date().toString()}</span>`;
  }

  /* ── open ──────────────────────────────────────────────────── */
  openLink(args) {
    if (!args.length) return '<span class="error">open: missing argument</span>';

    const target = args[0];

    /* direct URL */
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank', 'noopener');
      return `<span class="success">Opening</span> <a href="${this.escapeHtml(target)}" target="_blank" rel="noopener">${this.escapeHtml(target)}</a>`;
    }

    /* try to extract URL from a file */
    const filePath = this.resolvePath(target);
    const node     = this.nodeAt(filePath);
    if (node?.type === 'file') {
      const urlMatch = node.content.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        window.open(urlMatch[0], '_blank', 'noopener');
        return `<span class="success">Opening</span> <a href="${this.escapeHtml(urlMatch[0])}" target="_blank" rel="noopener">${this.escapeHtml(urlMatch[0])}</a>`;
      }
      return `<span class="warn">open: no URL found in ${this.escapeHtml(target)}</span>`;
    }

    return `<span class="error">open: ${this.escapeHtml(target)}: not a URL or file</span>`;
  }

  /* ── clear ─────────────────────────────────────────────────── */
  clear() {
    document.getElementById('output').innerHTML = '';
  }
}

/* ── Boot ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => new Terminal());


