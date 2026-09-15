const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function read(name){return fs.readFileSync(path.join(__dirname,'..',name),'utf8');}
const app=read('app.js');
const masterySource=read('mastery-domain-v7.js');

test('raw completed flag cannot bypass current Learning Lab evidence',()=>{
  assert.match(app,/state\.completed\.includes\(lesson\.id\) && labReady\(lesson\)\.ready/);
  const context={window:{}}; vm.runInNewContext(masterySource,context);
  const api=context.window.PM01MasteryV7;
  const lesson={id:'outcome-tree',learningLab:{drills:[{id:'d1',required:true}],workbookFields:[{id:'f1',required:true}]}};
  const modules=[{lessons:[lesson]}];
  const derived=api.derive({courseState:{completed:['outcome-tree'],lab:{}},modules});
  assert.equal(derived.skills.value.level,0);
});

test('decision alone reaches understanding but not application',()=>{
  const context={window:{}}; vm.runInNewContext(masterySource,context); const api=context.window.PM01MasteryV7;
  const lesson={id:'outcome-tree',learningLab:{drills:[{id:'d1',required:true}],workbookFields:[{id:'f1',required:true}]}};
  const derived=api.derive({courseState:{completed:['outcome-tree'],lab:{'outcome-tree':{drillAnswers:{d1:'x'},workbook:{}}}},modules:[{lessons:[lesson]}]});
  assert.equal(derived.skills.value.level,1); assert.equal(derived.skills.value.label,'Понял');
});

test('complete current evidence plus completion reaches application',()=>{
  const context={window:{}}; vm.runInNewContext(masterySource,context); const api=context.window.PM01MasteryV7;
  const lesson={id:'outcome-tree',learningLab:{drills:[{id:'d1',required:true}],workbookFields:[{id:'f1',required:true}]}};
  const derived=api.derive({courseState:{completed:['outcome-tree'],lab:{'outcome-tree':{drillAnswers:{d1:'x'},workbook:{f1:'fact'}}}},modules:[{lessons:[lesson]}]});
  assert.equal(derived.skills.value.level,2); assert.equal(derived.skills.value.label,'Применил');
});
