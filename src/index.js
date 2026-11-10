import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const HELP = `Usage: create-heliumts-app <directory> [options]

  --template <minimal|examples>  Starter (default: minimal)
  --tailwind                    Use Tailwind CSS
  --no-tailwind                 Use plain CSS (default)
  --skip-install                Scaffold without running npm install
  --json                        Emit one JSON result; install output goes to stderr
  -h, --help                    Show help
  -v, --version                 Show version

No prompts are used. Non-interactive runs use the same defaults.
Example: npx create-heliumts-app my-app --template examples`;

export function parseArgs(args) {
    const result = { projectName: null, template: 'minimal', tailwind: false, skipInstall: false, json: false };
    const seen = new Set();
    let positionalOnly = false;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!positionalOnly && arg === '--') { positionalOnly = true; continue; }
        if (!positionalOnly && arg.startsWith('-')) {
            const key = ({ '-h': '--help', '-v': '--version', '--no-tailwind': '--tailwind' })[arg] || arg;
            if (seen.has(key)) throw new Error(`Duplicate or conflicting option: ${arg}`);
            seen.add(key);
            switch (arg) {
                case '-h': case '--help': result.help = true; break;
                case '-v': case '--version': result.version = true; break;
                case '--tailwind': result.tailwind = true; break;
                case '--no-tailwind': result.tailwind = false; break;
                case '--skip-install': result.skipInstall = true; break;
                case '--json': result.json = true; break;
                case '--template': {
                    const value = args[++i];
                    if (!['examples', 'minimal'].includes(value)) throw new Error('--template requires examples or minimal');
                    result.template = value;
                    break;
                }
                default: throw new Error(`Unknown option: ${arg}`);
            }
        } else {
            if (result.projectName !== null) throw new Error('Expected exactly one project directory');
            if (!arg.trim()) throw new Error('Project directory must not be empty');
            result.projectName = arg;
        }
    }
    if (result.help && result.version) throw new Error('Choose --help or --version');
    if (!result.help && !result.version && result.projectName === null) throw new Error('Specify a project directory. Use --help for usage.');
    return result;
}

const renames = { gitignore: '.gitignore', prettierrc: '.prettierrc', prettierignore: '.prettierignore' };
const excludes = new Set(['node_modules', 'dist', 'dist-ssr', '.git', '.DS_Store', '.vite', '.cache', 'coverage', 'package-lock.json']);
function copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (excludes.has(entry.name)) continue;
        const from = path.join(src, entry.name);
        const to = path.join(dest, renames[entry.name] || entry.name);
        if (entry.isDirectory()) copyDirectory(from, to);
        else if (entry.name === 'package.json' && fs.existsSync(to)) {
            const base = JSON.parse(fs.readFileSync(to, 'utf8'));
            const overlay = JSON.parse(fs.readFileSync(from, 'utf8'));
            for (const [key, value] of Object.entries(overlay)) {
                base[key] = typeof value === 'object' && !Array.isArray(value) ? { ...base[key], ...value } : value;
            }
            fs.writeFileSync(to, JSON.stringify(base, null, 2) + '\n');
        } else fs.copyFileSync(from, to);
    }
}

function quoteDirectory(directory) {
    return process.platform === 'win32' ? '"' + directory.replace(/"/g, '""') + '"' : "'" + directory.replace(/'/g, "'\\''") + "'";
}

export async function createApp(args = process.argv.slice(2)) {
    let options;
    let targetDir;
    let scaffolded = false;
    const terminator = args.indexOf('--');
    const json = (terminator === -1 ? args : args.slice(0, terminator)).includes('--json');
    try {
        options = parseArgs(args);
        if (options.help || options.version) {
            console.log(options.json ? JSON.stringify(options.help ? { help: HELP } : { version }) : options.help ? HELP : version);
            return;
        }
        targetDir = path.resolve(options.projectName);
        if (fs.existsSync(targetDir) && (!fs.statSync(targetDir).isDirectory() || fs.readdirSync(targetDir).some(name => !['.git', '.DS_Store'].includes(name)))) {
            throw new Error(`The directory "${options.projectName}" is not empty or is not a directory.`);
        }
        const templates = path.join(root, 'templates');
        copyDirectory(path.join(templates, 'base'), targetDir);
        copyDirectory(path.join(templates, 'starters', options.template), targetDir);
        if (options.tailwind) {
            copyDirectory(path.join(templates, 'styles', 'tailwind'), targetDir);
            if (options.template === 'examples') copyDirectory(path.join(templates, 'starters', 'examples-tailwind'), targetDir);
            else {
                const css = path.join(targetDir, 'src/styles.css');
                fs.writeFileSync(css, '@import "tailwindcss";\n' + fs.readFileSync(css, 'utf8'));
            }
        }
        const manifestPath = path.join(targetDir, 'package.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifest.name = path.basename(targetDir).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9._-]/g, '-').replace(/^[._]+/, '') || 'helium-app';
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
        scaffolded = true;
        if (!options.skipInstall) {
            const installed = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'], {
                cwd: targetDir, stdio: options.json ? ['ignore', 2, 2] : 'inherit', shell: process.platform === 'win32',
            });
            if (installed.error || installed.status !== 0) throw new Error('Dependency installation failed. Project files were created; run npm install in the project directory to retry.');
        }
        const nextSteps = [
            ...(options.projectName === '.' ? [] : [`cd ${quoteDirectory(options.projectName.startsWith('-') ? `./${options.projectName}` : options.projectName)}`]),
            ...(options.skipInstall ? ['npm install'] : []),
            'npm run dev',
        ];
        if (options.json) console.log(JSON.stringify({ ok: true, directory: targetDir, template: options.template, style: options.tailwind ? 'tailwind' : 'css', scaffolded, dependenciesInstalled: !options.skipInstall, nextSteps }));
        else console.log(`Project scaffolded in ${targetDir}.\n${options.skipInstall ? 'Skipped dependency installation.' : 'Dependencies installed.'}\n\nNext steps:\n  ${nextSteps.join('\n  ')}`);
    } catch (error) {
        process.exitCode = 1;
        const message = error instanceof Error ? error.message : String(error);
        if (json) console.log(JSON.stringify({ ok: false, error: message, ...(targetDir ? { directory: targetDir } : {}), scaffolded, dependenciesInstalled: false }));
        else console.error(`Error: ${message}`);
    }
}
