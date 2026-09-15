const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }
function hexToRgb(hex) { const v = hex.replace('#',''); return [0,2,4].map(o => parseInt(v.slice(o,o+2),16)); }
function luminance(hex) { const rgb = hexToRgb(hex).map(v => { const c=v/255; return c<=.03928?c/12.92:((c+.055)/1.055)**2.4; }); return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]; }
function contrast(a,b) { const [l,d]=[luminance(a),luminance(b)].sort((x,y)=>y-x); return (l+.05)/(d+.05); }
function lightToken(css,name) { const block=css.match(/html\[data-theme="light"\][^{]*\{([\s\S]*?)\}/)?.[1]||''; const m=block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`)); assert.ok(m,`missing ${name}`); return m[1]; }

test('v3 reference/theme remain data contracts while canonical v7 owns presentation', () => {
  const html=read('index.html'); const simulator=read('simulator.html');
  assert.ok(html.includes('theme-contract-v3.css'));
  assert.ok(html.includes('practice-reference-v3.js'));
  assert.ok(html.includes('course-learning-labs-v7.js'));
  assert.equal(html.includes('course-clarity-v3.js'),false);
  assert.equal(html.includes('guided-practice-v2.js'),false);
  assert.ok(html.indexOf('practice-reference-v3.js') < html.indexOf('course-learning-labs-v7.js'));
  assert.ok(html.indexOf('course-learning-labs-v7.js') < html.indexOf('app.js'));
  assert.ok(simulator.includes('theme-contract-v3.css'));
  assert.ok(simulator.includes('canonical-runtime-v7.css'));
  assert.equal(simulator.includes('learning-experience-v2.css'),false);
});

test('light theme contract keeps readable semantic tokens', () => {
  const css=read('theme-contract-v3.css');
  const bg=lightToken(css,'--tc-bg'); const surface=lightToken(css,'--tc-surface'); const text=lightToken(css,'--tc-text'); const muted=lightToken(css,'--tc-text-muted');
  assert.ok(contrast(text,bg)>=7); assert.ok(contrast(text,surface)>=7); assert.ok(contrast(muted,bg)>=4.5);
  assert.ok(css.includes('--ink-2: var(--tc-surface)'));
});

test('all non-M01 reference solutions remain substantial and feed canonical labs', () => {
  const context={window:{}}; vm.createContext(context);
  vm.runInContext(read('course-data.js'),context); vm.runInContext(read('practice-scenarios-v2.js'),context); vm.runInContext(read('practice-reference-v3.js'),context);
  const data=context.window.PM01; const lessons=data.modules.flatMap(m=>m.lessons.map(l=>({...l,moduleId:m.id}))).filter(l=>l.moduleId!=='m01');
  assert.equal(lessons.length,18); assert.equal(Object.keys(data.practiceReferenceSolutions).length,18);
  for (const lesson of lessons) { const ref=lesson.referenceSolution; assert.ok(ref); assert.ok(ref.steps.length>=3); assert.ok(ref.steps.join(' ').length>=180); assert.ok(ref.check.length>=50); }
  const normalizer=read('course-learning-labs-v7.js'); assert.match(normalizer,/lesson\.referenceSolution/); assert.match(normalizer,/workedExample/);
});

test('M01 final practice stays a module step, not a global destination', () => {
  const app=read('app.js'); const html=read('index.html'); const simulator=read('simulator.html');
  assert.match(app,/module\.id === 'm01'/); assert.match(app,/simulator\.html#\/mission\/m01/); assert.match(app,/Итоговая практика M01/);
  const nav=html.match(/<nav class="main-nav">([\s\S]*?)<\/nav>/)?.[1]||'';
  assert.doesNotMatch(nav,/simulator\.html|Итоговая практика M01/);
  assert.ok(simulator.includes('Итоговый кейс M01'));
});
