import assert from 'node:assert/strict';
import { compressImage } from '../src/utils/imageCompressor.js';

const passed = [];
const failed = [];

async function test(name, fn) {
  try {
    await fn();
    passed.push(name);
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed.push(name);
    console.error(`FAIL  ${name}`);
    console.error('      ' + err.message);
  }
}

function createFakeImage(filename, type, size) {
  return new global.File([], filename, { type: type, size: size || 2 * 1024 * 1024 });
}

function installBrowserFakes({ captureFill, captureClear, captureExportType }) {
  global.File = class FakeFile {
    constructor(parts, name, opts) {
      this.name = name;
      this.type = opts.type;
      this.size = opts.size || 1024 * 1024;
    }
  };
  global.FileReader = class FakeFileReader {
    readAsDataURL() {
      this.onload && this.onload({ target: { result: 'data:image/png;base64,AAAA' } });
    }
  };
  global.Image = class FakeImage {
    set src(v) {
      this.onload && this.onload();
    }
    constructor() {
      this.width = 2000;
      this.height = 1000;
    }
  };
  global.document = {
    createElement: () => ({
      set width(v) {},
      set height(v) {},
      getContext: () => ({
        fillStyle: null,
        fillRect: (...args) => captureFill && captureFill(args),
        clearRect: (...args) => captureClear && captureClear(args),
        drawImage: () => {},
      }),
      toBlob: (cb, type, quality) => {
        captureExportType && captureExportType({ type, quality });
        cb(new Blob(['x'.repeat(100)], { type }));
      },
    }),
  };
}

async function run() {
  console.log('Running Image Compressor Tests...\n');

  await test('PNG input exports as PNG and clears (not fills) the canvas', async () => {
    let cleared = false;
    let filled = false;
    let exportType = null;
    installBrowserFakes({
      captureClear: () => (cleared = true),
      captureFill: () => (filled = true),
      captureExportType: ({ type }) => (exportType = type),
    });
    const result = await compressImage(createFakeImage('logo.png', 'image/png'));
    assert.strictEqual(result.compressed, true, 'PNG should be compressed');
    assert.strictEqual(result.file.type, 'image/png', 'output type should stay PNG');
    assert.ok(result.file.name.endsWith('.png'), 'output name should end with .png');
    assert.ok(cleared, 'canvas should be cleared for transparency');
    assert.ok(!filled, 'PNG should NOT get a white background fill');
    assert.strictEqual(exportType, 'image/png');
  });

  await test('JPEG input keeps white fill and JPEG export', async () => {
    let filled = false;
    let exportType = null;
    installBrowserFakes({
      captureFill: () => (filled = true),
      captureExportType: ({ type }) => (exportType = type),
    });
    const result = await compressImage(createFakeImage('photo.jpg', 'image/jpeg'));
    assert.strictEqual(result.file.type, 'image/jpeg');
    assert.ok(result.file.name.endsWith('.jpg'));
    assert.ok(filled, 'JPEG should keep the white background fill');
    assert.strictEqual(exportType, 'image/jpeg');
  });

  await test('Small JPEG files are returned untouched', async () => {
    global.FileReader = class FakeFileReader {
      readAsDataURL() {
        throw new Error('should not read a small file');
      }
    };
    const small = createFakeImage('tiny.jpg', 'image/jpeg', 100 * 1024);
    const result = await compressImage(small);
    assert.strictEqual(result.compressed, false);
    assert.strictEqual(result.file, small);
  });

  await test('Non-image files are returned untouched', async () => {
    const notImage = { name: 'notes.txt', type: 'text/plain', size: 500 };
    const result = await compressImage(notImage);
    assert.strictEqual(result.compressed, false);
  });

  console.log(`\n${passed.length} passed, ${failed.length} failed`);
  if (failed.length) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});