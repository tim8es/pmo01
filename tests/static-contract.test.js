const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name){const file=path.join(__dirname,'..',name);return fs.existsSync(file)?fs.readFileSync(file,'utf8'):'';}
const html=read('index.html'); const baseApp=read('app.js'); const validationApp=read('m01-validation-app.js'); const validationHook=read('m01-validation-course-hook-v7.js'); const validationStyles=read('m01-validation.css'); const labData=read('m01-learning-lab-data.js'); const artDirection=read('art-direction.css');

test('index loads validation data and canonical domains before base app then validation extension',()=>{
  assert.notEqual(html.indexOf('href="m01-validation.css"'),-1);
  const scripts=['course-data.js','m01-validation-data.js','m01-learning-lab-data.js','course-learning-labs-v7.js','module-practice-domain-v7.js','mastery-domain-v7.js','app.js','m01-validation-course-hook-v7.js','m01-validation-app.js'];
  let last=-1; for(const script of scripts){const i=html.indexOf(`src="${script}"`);assert.notEqual(i,-1,`missing ${script}`);assert.ok(i>last,`${script} order`);last=i;}
});

test('base router reserves M01 validation route for the extension',()=>{assert.match(baseApp,/route:\s*['"]validation-m01['"]/);assert.match(baseApp,/if \(route === ['"]validation-m01['"]\) return/);});

test('canonical course exposes only the narrow anchor needed by validation CTA',()=>{
  assert.match(validationHook,/querySelector\(['"]\.v7-module-list['"]\)/); assert.match(validationHook,/classList\.add\(['"]module-list['"]\)/); assert.doesNotMatch(validationHook,/innerHTML|insertAdjacentHTML|MutationObserver|fetch\s*\(/);
  assert.ok(validationApp.includes("querySelector('.module-list')"));
});

test('validation extension owns M01 validation route and CTA',()=>{assert.ok(validationApp.includes('validation/m01'));assert.ok(validationApp.includes('data-validation-cta'));});
test('validation keeps isolated storage',()=>assert.ok(validationApp.includes('pm01-validation-m01-v1')));
test('validation UI stays semantic',()=>{for(const token of ['<fieldset','<legend','aria-live="polite"','for="'])assert.ok(validationApp.includes(token));});
test('validation styles stay isolated',()=>{for(const token of ['.validation-shell','.validation-score','.validation-evidence'])assert.ok(validationStyles.includes(token));});
test('M01 lab data loads before canonical normalizer/app and keeps stable cold IDs',()=>{assert.ok(html.indexOf('m01-learning-lab-data.js')>html.indexOf('m01-validation-data.js'));assert.ok(html.indexOf('m01-learning-lab-data.js')<html.indexOf('course-learning-labs-v7.js'));assert.ok(html.indexOf('course-learning-labs-v7.js')<html.indexOf('app.js'));for(const token of ['project-system','system-diagnostic','m01-drill-system','m01-drill-diagnostic','workbookFields','transferPrompt'])assert.ok(labData.includes(token));});
test('Editorial Instrument retains readable text and learning-lab/focus contracts',()=>{for(const token of ['--text-secondary:','--text-tertiary:','.learning-lab','.lab-feedback','.lab-workbook',':focus-visible'])assert.ok(artDirection.includes(token));});
