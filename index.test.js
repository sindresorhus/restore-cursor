import process from 'node:process';
import {test} from 'node:test';
import assert from 'node:assert';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import {unlinkSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const getResourcePath = path => new URL(path, import.meta.url);
const modulePath = getResourcePath('./index.js');

const file = fileURLToPath(getResourcePath(`${os.tmpdir}/test.mjs`));

const script = `
if (process.argv[2] === '1') {
	process.stdout.isTTY = true;
}

if (process.argv[3] === '1') {
	process.stderr.isTTY = true;
}

// Affordance for Node.js 16+ bug.
process.stderr.hasColors = () => false;

const {default: restoreCursor} = await import(${JSON.stringify(modulePath)});

restoreCursor();

delete process.stdout.isTTY;
delete process.stderr.isTTY;
`;

const restoreCode = '\u001B[?25h';

test('write test script', async () => {
	writeFileSync(file, script);
});

test('stdout tty, stderr not, write to stdout', async () => {
	const result = spawnSync(process.execPath, [file, '1', '0'], {encoding: 'utf8'});
	assert.equal(result.status, 0);
	assert.deepStrictEqual([result.stdout, result.stderr], [restoreCode, '']);
});

test('stderr tty, stdout not, write to stderr', async () => {
	const result = spawnSync(process.execPath, [file, '0', '1'], {encoding: 'utf8'});
	assert.deepStrictEqual([result.stdout, result.stderr], ['', restoreCode]);
});

test('both tty, write to stderr', async () => {
	const result = spawnSync(process.execPath, [file, '1', '1'], {encoding: 'utf8'});
	assert.deepStrictEqual([result.stdout, result.stderr], ['', restoreCode]);
});

test('neither tty, write nowhere', async () => {
	const result = spawnSync(process.execPath, [file, '0', '0'], {encoding: 'utf8'});
	assert.deepStrictEqual([result.stdout, result.stderr], ['', '']);
});

test('remove test script', () => {
	unlinkSync(file);
});
