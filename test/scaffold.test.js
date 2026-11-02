import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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
    for (const template of ['basic', 'tailwind']) {
        const templateManifest = JSON.parse(readFileSync(new URL(`../templates/${template}/package.json`, import.meta.url), 'utf8'));
        assert.equal(templateManifest.dependencies.heliumts, `^${manifest.version}`);
        const lock = JSON.parse(readFileSync(new URL(`../templates/${template}/package-lock.json`, import.meta.url), 'utf8'));
        assert.equal(lock.packages[''].dependencies.heliumts, templateManifest.dependencies.heliumts);
        assert.equal(lock.packages['node_modules/heliumts'].version, manifest.version);
    }
});

for (const template of ['basic', 'tailwind']) {
    test(`scaffolds the ${template} template without installing dependencies`, (context) => {
        const directory = temporaryDirectory(context);
        const result = scaffold(directory, ['my-app', template === 'tailwind' ? '--tailwind' : '--no-tailwind', '--skip-install']);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        const target = path.join(directory, 'my-app');
        const manifest = JSON.parse(readFileSync(path.join(target, 'package.json'), 'utf8'));
        const lock = JSON.parse(readFileSync(path.join(target, 'package-lock.json'), 'utf8'));
        assert.equal(manifest.name, 'my-app');
        assert.equal(manifest.dependencies.heliumts, '^0.9.6');
        assert.equal(manifest.devDependencies.vite, '^7.3.7');
        assert.equal(manifest.engines.node, '^20.19.0 || >=22.12.0');
        assert.equal(Boolean(manifest.dependencies.tailwindcss), template === 'tailwind');
        assert.equal(lock.name, 'my-app');
        assert.equal(lock.packages[''].name, 'my-app');
        assert.equal(existsSync(path.join(target, '.gitignore')), true);
        assert.equal(existsSync(path.join(target, '.prettierrc')), true);
        assert.equal(existsSync(path.join(target, '.prettierignore')), true);
        assert.equal(existsSync(path.join(target, 'gitignore')), false);
        assert.equal(existsSync(path.join(target, 'node_modules')), false);
        assert.match(readFileSync(path.join(target, 'helium.config.ts'), 'utf8'), /trustProxyDepth: 0/);
        assert.match(result.stdout, /Skipped dependency installation/);
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
