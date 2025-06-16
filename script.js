class Terminal {
  constructor() {
    this.currentPath = '/home/lukezielke';
    this.user = 'root';
    this.host = 'lukezielke';
    this.commandHistory = [];
    this.historyIndex = -1;
    this.isTyping = false;

    // File system structure
    this.fileSystem = {
      '/': {
        type: 'directory',
        contents: {
          'home': { type: 'directory', contents: { 'lukezielke': { type: 'directory', contents: {} } } },
          'etc': { type: 'directory', contents: {} },
          'var': { type: 'directory', contents: {} },
          'usr': { type: 'directory', contents: {} }
        }
      }
    };

    this.commands = {
      'ls': this.ls.bind(this),
      'cd': this.cd.bind(this),
      'cat': this.cat.bind(this),
      'clear': this.clear.bind(this),
      'help': this.help.bind(this)
    };

    this.init();
  }

  async init() {
    // Load text files
    await this.loadFiles();
    this.updatePrompt();
    this.showWelcome();
    this.setupEventListeners();
    document.getElementById('command-input').focus();
  }

  async loadFiles() {
    const files = [
      { name: 'about.txt', path: 'texts/about.txt' },
      { name: 'skills.txt', path: 'texts/skills.txt' },
      { name: 'contact.txt', path: 'texts/contact.txt' },
    ];


    const homeDir = this.fileSystem['/'].contents.home.contents.lukezielke;

    // Load files into home directory
    for (const file of files) {
      try {
        const response = await fetch(file.path);
        const content = await response.text();
        homeDir.contents[file.name] = { type: 'file', content };
      } catch (error) {
        console.warn(`Could not load ${file.path}, using fallback content`);
        this.addFallbackContent(file.name);
      }
    }

  }



  addFallbackContent(fileName = null) {
    const homeDir = this.fileSystem['/'].contents.home.contents.lukezielke;

    const fallbackFiles = {
      'about.txt': `Hi!

My name is Luke Zielke and I am a Software Developer from Germany.
I am currently studying IT Systems Engineering at Hasso Plattner Institute.
You can check out all of my projects on my GitHub Page: https://github.com/lukezielke
Feel free to contribute!

Any questions? Got a Job?
Contact me via email at lukezielke@protonmail.com

Cheers and keep on hacking!`,
      'skills.txt': `Programming Languages:
- Python
- Dart
- C/C++
- JavaScript
- HTML/CSS

Frameworks & Technologies:
- Flutter
- Git
- Linux/Unix

Interests: 
- Scraping
- Security`,
      'contact.txt': `Contact Information:
Email: lukezielke@protonmail.com
GitHub: https://github.com/lukezielke
LinkedIn: https://www.linkedin.com/in/luke-zielke-581b60295/`
    };

    if (fileName && fallbackFiles[fileName]) {
      homeDir.contents[fileName] = {
        type: 'file',
        content: fallbackFiles[fileName]
      };
    } else if (!fileName) {
      // Add all fallback content
      Object.keys(fallbackFiles).forEach(name => {
        this.addFallbackContent(name);
      });
    }
  }

  updatePrompt() {
    const promptElement = document.getElementById('prompt');
    const shortPath = this.currentPath.replace('/home/lukezielke', '~');
    promptElement.innerHTML = `<span class="user">${this.user}</span>@<span class="host">${this.host}</span>:<span class="path">${shortPath}</span><span class="dollar">$</span> `;
  }

  showWelcome() {
    const welcomeText = `Welcome to my Website!
Type 'help' for available commands.

`;
    this.typeText(welcomeText, () => {
      this.updatePrompt();
    });
  }

  setupEventListeners() {
    const input = document.getElementById('command-input');

    input.addEventListener('keydown', (e) => {
      if (this.isTyping) return;

      if (e.key === 'Enter') {
        this.executeCommand(input.value.trim());
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(1);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autoComplete(input);
      }
    });

    // Keep input focused
    document.addEventListener('click', () => {
      if (!this.isTyping) {
        input.focus();
      }
    });
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    this.historyIndex += direction;
    if (this.historyIndex < 0) this.historyIndex = 0;
    if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      document.getElementById('command-input').value = '';
      return;
    }

    document.getElementById('command-input').value = this.commandHistory[this.historyIndex];
  }

  autoComplete(input) {
    const value = input.value;
    const parts = value.split(' ');
    const lastPart = parts[parts.length - 1];

    if (parts.length === 1) {
      // Complete command
      const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(lastPart));
      if (matches.length === 1) {
        input.value = matches[0];
      }
    } else {
      // Complete file/directory names
      const currentDir = this.getCurrentDirectory();
      if (currentDir && currentDir.contents) {
        const matches = Object.keys(currentDir.contents).filter(name => name.startsWith(lastPart));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          input.value = parts.join(' ');
        }
      }
    }
  }

  executeCommand(commandLine) {
    if (!commandLine) return;

    this.commandHistory.push(commandLine);
    this.historyIndex = this.commandHistory.length;

    const output = document.getElementById('output');
    const promptText = document.getElementById('prompt').textContent;

    // Echo command with distinct style
    output.innerHTML += `<div class="echo-line"><span class="prompt-text">${promptText}</span><span class="echo">${commandLine}</span></div>`;

    const parts = commandLine.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    const runCommand = () => {
      if (this.commands[command]) {
        const result = this.commands[command](args);
        if (result) {
          this.typeText(`<div class="command-output">${result}</div>\n`, () => this.scrollToBottom());
        } else {
          this.scrollToBottom();
        }
      } else {
        this.typeText(`<div class="command-output"><span class="error">Command not found: ${command}</span></div>\n`, () => this.scrollToBottom());
      }
    };

    runCommand();
  }




  typeText(text, callback) {
    const output = document.getElementById('output');
    let i = 0;
    let tagBuffer = '';
    let inTag = false;

    const typeChar = () => {
      if (i < text.length) {
        const char = text[i];

        // Preserve HTML tag integrity
        if (char === '<') inTag = true;
        if (inTag) {
          tagBuffer += char;
          if (char === '>') {
            output.innerHTML += tagBuffer;
            tagBuffer = '';
            inTag = false;
          }
        } else {
          output.innerHTML += char;
        }

        i++;
        setTimeout(typeChar, Math.random() * 20 + 10);
      } else {
        if (callback) callback();
      }
    };

    typeChar();
  }



  scrollToBottom() {
    const output = document.getElementById('output');
    output.scrollTop = output.scrollHeight;
  }

  getCurrentDirectory() {
    const pathParts = this.currentPath.split('/').filter(part => part);
    let current = this.fileSystem['/'];

    for (const part of pathParts) {
      if (current.contents && current.contents[part]) {
        current = current.contents[part];
      } else {
        return null;
      }
    }

    return current;
  }

  resolvePath(path) {
    if (path.startsWith('/')) {
      return path;
    } else if (path === '~') {
      return '/home/lukezielke';
    } else if (path.startsWith('~/')) {
      return '/home/lukezielke' + path.slice(1);
    } else {
      return this.currentPath + '/' + path;
    }
  }

  // Commands
  ls(args) {
    const currentDir = this.getCurrentDirectory();
    if (!currentDir || currentDir.type !== 'directory') {
      return '<span class="error">Not a directory</span>';
    }

    let result = '';
    const items = Object.keys(currentDir.contents);

    if (items.length === 0) {
      return '';
    }

    items.forEach(name => {
      const item = currentDir.contents[name];
      if (item.type === 'directory') {
        result += `<span class="directory">${name}/</span>  `;
      } else {
        result += `<span class="file">${name}</span>  `;
      }
    });

    return result.trim();
  }

  cd(args) {
    if (args.length === 0) {
      this.currentPath = '/home/lukezielke';
      this.updatePrompt();
      return;
    }

    const targetPath = this.resolvePath(args[0]);
    const pathParts = targetPath.split('/').filter(part => part);
    let current = this.fileSystem['/'];

    for (const part of pathParts) {
      if (current.contents && current.contents[part] && current.contents[part].type === 'directory') {
        current = current.contents[part];
      } else {
        return `<span class="error">cd: ${args[0]}: No such file or directory</span>`;
      }
    }

    this.currentPath = targetPath;
    this.updatePrompt();
    return;
  }

  cat(args) {
    if (args.length === 0) {
      return '<span class="error">cat: missing file operand</span>';
    }

    const currentDir = this.getCurrentDirectory();
    const fileName = args[0];

    if (currentDir.contents && currentDir.contents[fileName]) {
      const file = currentDir.contents[fileName];
      if (file.type === 'file') {
        return file.content.replace(/\n/g, '\n');
      } else {
        return `<span class="error">cat: ${fileName}: Is a directory</span>`;
      }
    } else {
      return `<span class="error">cat: ${fileName}: No such file or directory</span>`;
    }
  }

  clear(args) {
    document.getElementById('output').innerHTML = '';
    return;
  }

  help(args) {
    return `Available commands:
<span class="info">ls</span>    - List directory contents
<span class="info">cd</span>    - Change directory
<span class="info">cat</span>   - Display file contents
<span class="info">clear</span> - Clear screen
<span class="info">help</span>  - Show this help

Use Tab for autocompletion, ↑/↓ for command history`;
  }
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Terminal();
});