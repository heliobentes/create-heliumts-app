import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const releaseVersion = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const cli = fileURLToPath(new URL('../bin/index.js', import.meta.url));

function temporaryDirectory(context) {
    const directory = mkdtempSync(path.join(tmpdir(), 'create-heliumts-app-'));
    context.after(() => rmSync(directory, { recursive: true, force: true }));
    return directory;
}

function scaffold(cwd, args) {
    return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', timeout: 10_000 });
}

test('keeps scaffolder and template framework releases aligned', () => {
    const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    for (const template of ['base', 'styles/tailwind']) {
        const templateManifest = JSON.parse(readFileSync(new URL(`../templates/${template}/package.json`, import.meta.url), 'utf8'));
        if (template === 'base') assert.equal(templateManifest.dependencies.heliumts, `^${manifest.version}`);
        assert.equal(existsSync(new URL(`../templates/${template}/package-lock.json`, import.meta.url)), false);
    }
});

for (const starter of ['minimal', 'examples']) for (const template of ['basic', 'tailwind']) {
    test(`scaffolds ${starter}/${template} without installing dependencies`, (context) => {
        const directory = temporaryDirectory(context);
        const result = scaffold(directory, ['my-app', '--template', starter, template === 'tailwind' ? '--tailwind' : '--no-tailwind', '--skip-install']);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        const target = path.join(directory, 'my-app');
        const manifest = JSON.parse(readFileSync(path.join(target, 'package.json'), 'utf8'));
        assert.equal(manifest.name, 'my-app');
        assert.equal(manifest.dependencies.heliumts, `^${releaseVersion}`);
        assert.equal(manifest.devDependencies.vite, '^7.3.7');
        assert.equal(manifest.engines.node, '^20.19.0 || >=22.12.0');
        assert.equal(Boolean(manifest.dependencies.tailwindcss), template === 'tailwind');
        assert.equal(existsSync(path.join(target, 'package-lock.json')), false);
        assert.equal(existsSync(path.join(target, '.gitignore')), true);
        assert.equal(existsSync(path.join(target, '.prettierrc')), true);
        assert.equal(existsSync(path.join(target, '.prettierignore')), true);
        assert.equal(existsSync(path.join(target, 'gitignore')), false);
        assert.equal(existsSync(path.join(target, 'node_modules')), false);
        const config = readFileSync(path.join(target, 'helium.config.ts'), 'utf8');
        if (starter === 'examples') {
            assert.match(config, /trustProxyDepth: 0/);
            assert.match(config, /maxRequestsPerWindow: 200/);
        } else {
            assert.match(config, /export default \{\} satisfies HeliumConfig/);
            assert.doesNotMatch(config, /maxRequestsPerWindow|maxBodySize|maxBatchSize|tokenValidityMs/);
        }
        assert.ok(JSON.parse(readFileSync(path.join(target, 'tsconfig.app.json'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')).compilerOptions.types.includes('node'));
        assert.doesNotMatch(config, /transport|autoHttpOnMobile|maxWsPayload|maxConnectionsPerIP|maxMessagesPerWindow/);
        assert.equal(manifest.scripts.check, 'helium check');
        assert.equal(manifest.scripts.verify, 'npm run check && npm run lint && npm run build');
        assert.equal(manifest.scripts.build, 'helium build');
        assert.equal(manifest.scripts.inspect, 'helium inspect --json');
        const instructions = readFileSync(path.join(target, 'AGENTS.md'), 'utf8');
        assert.match(instructions, /node_modules\/heliumts\/docs\/agent-start\.md/);
        assert.match(instructions, /already embeds this context, do not read it again/);
        assert.match(instructions, /npm run verify/);
        assert.match(instructions, /helium api NAME --from client/);
        assert.match(instructions, /helium inspect --rpc NAME --json/);
        assert.match(instructions, /src\/rpc\.generated\.ts/);
        assert.match(instructions, /public UI\/client references/);
        for (const appPath of ['src/pages/', 'src/server/', 'src/styles.css', 'helium.config.ts', 'vite.config.ts']) {
            assert.ok(existsSync(path.join(target, appPath)), `Invalid app map path: ${appPath}`);
        }
        assert.match(readFileSync(path.join(target, 'README.md'), 'utf8'), /docs\/agent-start\.md/);
        assert.match(result.stdout, /Next steps:\s+cd ['"]my-app['"]\s+npm install\s+npm run dev\s*$/);

        // Exercise Git itself: a present .gitignore is not enough if its rules fail.
        const git = (...args) => spawnSync('git', args, { cwd: target, encoding: 'utf8', timeout: 10_000 });
        const initialized = git('init', '--quiet');
        assert.equal(initialized.status, 0, initialized.stderr);
        assert.equal(existsSync(path.join(target, 'src/rpc.generated.ts')), false);
        assert.equal(existsSync(path.join(target, 'src/types/heliumts-server.d.ts')), false);
        for (const generatedPath of ['node_modules/dependency/index.js', 'dist/client/index.html', 'dist-ssr/server.js', 'src/rpc.generated.ts']) {
            mkdirSync(path.dirname(path.join(target, generatedPath)), { recursive: true });
            writeFileSync(path.join(target, generatedPath), 'generated');
            const ignored = git('check-ignore', '--no-index', generatedPath);
            assert.equal(ignored.status, 0, `Not ignored: ${generatedPath}: ${ignored.stderr}`);
        }
        const source = git('check-ignore', '--no-index', 'src/pages/index.tsx');
        assert.equal(source.status, 1, 'Application source must remain trackable');
        const status = git('status', '--short', '--untracked-files=all');
        assert.equal(status.status, 0, status.stderr);
        assert.doesNotMatch(status.stdout, /node_modules\/|dist\/|dist-ssr\//);
        assert.match(status.stdout, /src\/pages\/index\.tsx/);
        assert.match(readFileSync(path.join(target, 'src/pages/index.tsx'), 'utf8'), /from "\.\.\/rpc\.generated"/);
        if (starter === 'examples') {
            const streamingPage = readFileSync(path.join(target, 'src/pages/streaming.tsx'), 'utf8');
            assert.match(streamingPage, /from "\.\.\/rpc\.generated"/);
            assert.match(streamingPage, /useStreaming\(streamText\)/);
            assert.match(readFileSync(path.join(target, 'src/server/streaming.ts'), 'utf8'), /signal: ctx.signal/);
        } else {
            assert.equal(existsSync(path.join(target, 'src/pages/streaming.tsx')), false);
            assert.match(readFileSync(path.join(target, 'src/server/greet.ts'), 'utf8'), /defineMethod/);
        }
        assert.match(result.stdout, /Skipped dependency installation/);
    });
}

for (const failStage of [undefined, 'check', 'lint', 'build']) {
    test(`starter verify runs each stage once and stops at ${failStage || 'completion'}`, (context) => {
        const directory = temporaryDirectory(context);
        const result = scaffold(directory, ['app', '--skip-install']);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        const app = path.join(directory, 'app');
        const file = path.join(app, 'package.json');
        const manifest = JSON.parse(readFileSync(file, 'utf8'));
        // Keep the generated verify command; deterministic child stages observe
        // its real npm ordering, failure propagation and lack of duplicate checks.
        for (const stage of ['check', 'lint', 'build']) manifest.scripts[stage] = `node stage.cjs ${stage}`;
        writeFileSync(file, JSON.stringify(manifest));
        writeFileSync(path.join(app, 'stage.cjs'), `
const fs = require('node:fs');
const stage = process.argv[2];
fs.appendFileSync('stages.txt', stage + '\\n');
if (process.env.FAIL_STAGE === stage) process.exit(7);
`);
        const verification = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'verify'], {
            cwd: app, encoding: 'utf8', timeout: 20_000,
            env: { ...process.env, FAIL_STAGE: failStage || '', npm_config_cache: path.join(directory, 'cache'), npm_config_offline: 'true' },
        });
        assert.equal(verification.status === 0, !failStage, verification.stdout + verification.stderr);
        const expected = ['check', 'lint', 'build'];
        if (failStage) expected.splice(expected.indexOf(failStage) + 1);
        assert.deepEqual(readFileSync(path.join(app, 'stages.txt'), 'utf8').trim().split('\n'), expected);
    });
}

test('normalizes the package name when the destination is an absolute nested path with spaces', (context) => {
    const directory = temporaryDirectory(context);
    const target = path.join(directory, 'Nested Folder', 'My  APP');
    const result = scaffold(directory, [target, '--no-tailwind', '--skip-install']);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(JSON.parse(readFileSync(path.join(target, 'package.json'), 'utf8')).name, 'my-app');
    assert.match(result.stdout, /cd ['"].*My  APP['"]/);
});

test('scaffolds in the current directory while preserving repository metadata', (context) => {
    const directory = temporaryDirectory(context);
    mkdirSync(path.join(directory, '.git'));
    writeFileSync(path.join(directory, '.git', 'config'), 'keep repository metadata');
    const result = scaffold(directory, ['.', '--no-tailwind', '--skip-install']);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(readFileSync(path.join(directory, '.git', 'config'), 'utf8'), 'keep repository metadata');
    assert.equal(existsSync(path.join(directory, 'src', 'pages', 'index.tsx')), true);
});

test('refuses to overwrite an existing dotfile', (context) => {
    const directory = temporaryDirectory(context);
    writeFileSync(path.join(directory, '.gitignore'), 'keep existing ignore rules');
    const result = scaffold(directory, ['.', '--no-tailwind', '--skip-install']);
    assert.equal(result.status, 1);
    assert.equal(readFileSync(path.join(directory, '.gitignore'), 'utf8'), 'keep existing ignore rules');
    assert.equal(existsSync(path.join(directory, 'package.json')), false);
});

for (const args of [['--help'], ['-h'], ['--version'], ['-v']]) {
    test(`informational flag ${args[0]} exits without writes`, context => {
        const directory = temporaryDirectory(context);
        const result = scaffold(directory, args);
        assert.equal(result.status, 0);
        assert.match(result.stdout, args[0].includes('v') ? new RegExp(releaseVersion.replaceAll('.', '\\.')) : /Usage:/);
        if (args[0] === '--help' || args[0] === '-h') {
            assert.match(result.stdout, /default: minimal/);
            assert.match(result.stdout, /--template examples/);
        }
        assert.equal(existsSync(path.join(directory, 'package.json')), false);
    });
}

for (const args of [[], ['app', '--wat'], ['one', 'two'], ['app', '--tailwind', '--no-tailwind'], ['app', '--template'], ['app', '--template', 'missing'], ['app', '--skip-install', '--skip-install'], ['']]) {
    test(`rejects invalid arguments ${JSON.stringify(args)}`, context => {
        const directory = temporaryDirectory(context);
        const result = scaffold(directory, args);
        assert.equal(result.status, 1);
        assert.equal(existsSync(path.join(directory, 'app')), false);
        assert.match(result.stderr, /Error:/);
    });
}

test('non-TTY defaults to minimal with plain CSS and emits only JSON', context => {
    const directory = temporaryDirectory(context);
    const result = scaffold(directory, ['app', '--skip-install', '--json']);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.template, 'minimal');
    assert.equal(output.style, 'css');
    assert.equal(output.dependenciesInstalled, false);
    assert.equal(output.ok, true);
    assert.deepEqual(output.nextSteps.slice(1), ['npm install', 'npm run dev']);
    assert.match(output.nextSteps[0], /^cd ['"]app['"]$/);
    assert.equal(existsSync(path.join(directory, 'app/src/server/greet.ts')), true);
    assert.equal(existsSync(path.join(directory, 'app/src/pages/streaming.tsx')), false);
});

test('JSON errors are structured and exit nonzero', context => {
    const result = scaffold(temporaryDirectory(context), ['app', '--unknown', '--json']);
    assert.equal(result.status, 1);
    assert.equal(JSON.parse(result.stdout).ok, false);
    assert.equal(result.stderr, '');
});

test('dependency installation failure preserves files but reports failure', context => {
    const directory = temporaryDirectory(context);
    // An empty PATH forces ENOENT without using the network or modifying npm.
    const result = spawnSync(process.execPath, [cli, 'app', '--json'], {
        cwd: directory, encoding: 'utf8', timeout: 10_000,
        env: { ...process.env, PATH: directory },
    });
    assert.equal(result.status, 1);
    const output = JSON.parse(result.stdout);
    assert.equal(output.ok, false);
    assert.equal(output.scaffolded, true);
    assert.equal(output.dependenciesInstalled, false);
    assert.match(output.error, /installation failed/);
    assert.equal(existsSync(path.join(directory, 'app/package.json')), true);
});

test('successful install output stays off JSON stdout', { skip: process.platform === 'win32' }, context => {
    const directory = temporaryDirectory(context);
    const bin = path.join(directory, 'bin');
    mkdirSync(bin);
    writeFileSync(path.join(bin, 'npm'), '#!/bin/sh\necho simulated-npm-output\nexit 0\n', { mode: 0o755 });
    const result = spawnSync(process.execPath, [cli, 'app', '--json'], {
        cwd: directory, encoding: 'utf8', timeout: 10_000,
        env: { ...process.env, PATH: bin },
    });
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.dependenciesInstalled, true);
    assert.deepEqual(output.nextSteps, ["cd 'app'", 'npm run dev']);
    assert.match(result.stderr, /simulated-npm-output/);
});

test('option terminator allows a directory beginning with a dash', context => {
    const directory = temporaryDirectory(context);
    const result = scaffold(directory, ['--skip-install', '--', '-app']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(directory, '-app/package.json')), true);
    assert.match(result.stdout, /cd '\.\/-app'/);
});

test('refuses an existing regular file as the target', context => {
    const directory = temporaryDirectory(context);
    writeFileSync(path.join(directory, 'app'), 'keep');
    const result = scaffold(directory, ['app', '--skip-install']);
    assert.equal(result.status, 1);
    assert.equal(readFileSync(path.join(directory, 'app'), 'utf8'), 'keep');
});

 test('option-like positionals do not enable JSON error mode', context => {
    const directory = temporaryDirectory(context);
    writeFileSync(path.join(directory, '--json'), 'keep');
    const result = scaffold(directory, ['--skip-install', '--', '--json']);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Error:/);
});
