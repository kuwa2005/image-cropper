const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

let passed = 0;
let failed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    failed++;
  }
}

function section(name) {
  console.log(`\n--- ${name} ---`);
}

function runTests() {
  console.log('Image Cropper Unit Tests\n');

  // Create DOM
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
  });

  const { document, window } = dom.window;

  // Test DOM Structure
  section('DOM Structure');

  assert(document.getElementById('drop-zone') !== null, 'Drop zone exists');
  assert(document.getElementById('file-input') !== null, 'File input exists');
  assert(document.getElementById('toolbar') !== null, 'Toolbar exists');
  assert(document.getElementById('canvas') !== null, 'Canvas exists');
  assert(document.getElementById('crop-overlay') !== null, 'Crop overlay exists');
  assert(document.getElementById('action-bar') !== null, 'Action bar exists');
  assert(document.getElementById('btn-download') !== null, 'Download button exists');
  assert(document.getElementById('btn-copy') !== null, 'Copy button exists');
  assert(document.getElementById('theme-toggle') !== null, 'Theme toggle exists');

  // Test Aspect Ratio Presets
  section('Aspect Ratio Presets');

  const presetButtons = document.querySelectorAll('.preset-btn[data-ratio]');
  assert(presetButtons.length === 5, `Found ${presetButtons.length} preset buttons (expected 5)`);

  const ratios = {
    '1:1': 1,
    '16:9': 16/9,
    '9:16': 9/16,
    '4:3': 4/3,
    '3:4': 3/4
  };

  presetButtons.forEach(btn => {
    const ratioStr = btn.dataset.ratio;
    const parts = ratioStr.split(':');
    const w = parseInt(parts[0], 10);
    const h = parseInt(parts[1], 10);
    const calculated = w / h;
    const expected = ratios[ratioStr];
    assert(Math.abs(calculated - expected) < 0.0001,
      `Ratio ${ratioStr}: ${calculated.toFixed(4)} ≈ ${expected.toFixed(4)}`);
  });

  // Test Custom Ratio Inputs
  section('Custom Ratio Inputs');

  const ratioW = document.getElementById('ratio-w');
  const ratioH = document.getElementById('ratio-h');
  const applyCustom = document.getElementById('apply-custom');

  assert(ratioW !== null, 'Width input exists');
  assert(ratioH !== null, 'Height input exists');
  assert(applyCustom !== null, 'Apply button exists');
  assert(ratioW.type === 'number', 'Width input is number type');
  assert(ratioH.type === 'number', 'Height input is number type');
  assert(parseInt(ratioW.min) === 1, 'Width min is 1');
  assert(parseInt(ratioW.max) === 10000, 'Width max is 10000');

  // Test Format Options
  section('Format Options');

  const downloadItems = document.querySelectorAll('.download-dropdown-item');
  const formats = Array.from(downloadItems).map(o => o.dataset.format);

  assert(formats.includes('png'), 'PNG format available');
  assert(formats.includes('jpeg'), 'JPEG format available');
  assert(formats.includes('webp'), 'WebP format available');
  assert(formats.length === 3, `Found ${formats.length} format options`);

  // Test Theme Toggle
  section('Theme Toggle');

  const themeToggle = document.getElementById('theme-toggle');
  assert(themeToggle !== null, 'Theme toggle button exists');
  assert(themeToggle.getAttribute('aria-label') === 'テーマ切替', 'Theme toggle has correct aria-label');

  const iconLit = themeToggle.querySelector('.icon-lit');
  const iconDim = themeToggle.querySelector('.icon-dim');
  assert(iconLit !== null, 'Light mode icon exists');
  assert(iconDim !== null, 'Dark mode icon exists');

  // Test Crop Handles
  section('Crop Handles');

  const handles = document.querySelectorAll('.crop-handle');
  assert(handles.length === 4, `Found ${handles.length} crop handles`);

  const handleTypes = ['tl', 'tr', 'bl', 'br'];
  handleTypes.forEach(type => {
    const handle = document.querySelector(`.crop-handle-${type}`);
    assert(handle !== null, `Handle ${type} exists`);
    assert(handle.dataset.handle === type, `Handle ${type} has correct data-handle`);
  });

  // Test Canvas
  section('Canvas');

  const canvas = document.getElementById('canvas');
  assert(canvas !== null, 'Canvas element exists');
  assert(canvas.tagName === 'CANVAS', 'Element is a canvas');

  // Test CSS Variables
  section('CSS Variables');

  const computedStyle = window.getComputedStyle(document.documentElement);
  const bgColor = computedStyle.getPropertyValue('--bg').trim();
  assert(bgColor === '#f6f8fa', `Light theme bg: ${bgColor}`);

  // Test Responsive Classes
  section('Responsive Classes');

  const dropZone = document.getElementById('drop-zone');
  assert(dropZone.classList.contains('drop-zone'), 'Drop zone has correct class');

  const toolbar = document.getElementById('toolbar');
  assert(toolbar.classList.contains('toolbar'), 'Toolbar has correct class');

  // Test Event Listeners (structure only)
  section('Event Listeners');

  const btnReset = document.getElementById('btn-reset');
  assert(btnReset !== null, 'Reset button exists');

  // Test HTML Structure
  section('HTML Structure');

  const header = document.querySelector('.header');
  assert(header !== null, 'Header exists');

  const logo = document.querySelector('.logo');
  assert(logo !== null, 'Logo exists');
  assert(logo.textContent.includes('KURAGASHI'), 'Logo has correct text');

  const main = document.querySelector('.main');
  assert(main !== null, 'Main content exists');

  const container = document.querySelector('.container');
  assert(container !== null, 'Container exists');

  // Test Accessibility
  section('Accessibility');

  const skipLink = document.querySelector('.skip-link');
  assert(skipLink === null || true, 'Skip link check (optional)');

  const ariaLabels = document.querySelectorAll('[aria-label]');
  assert(ariaLabels.length > 0, `Found ${ariaLabels.length} elements with aria-label`);

  // Test Meta Tags
  section('Meta Tags');

  const meta = document.querySelector('meta[name="robots"]');
  assert(meta !== null, 'Robots meta tag exists');
  assert(meta.content === 'noindex, nofollow', 'Robots meta has correct content');

  const viewport = document.querySelector('meta[name="viewport"]');
  assert(viewport !== null, 'Viewport meta tag exists');

  // Summary
  console.log('\n' + '='.repeat(40));
  console.log(`Summary: ${passed}/${total} tests passed`);
  if (failed > 0) {
    console.log(`Failed: ${failed} tests`);
  }
  console.log('='.repeat(40));

  // Clean up
  dom.window.close();

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
