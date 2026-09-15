const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const courseDataCode=fs.readFileSync(path.join(__dirname,'..','course-data.js'),'utf8');
const validationDataCode=fs.readFileSync(path.join(__dirname,'..','m01-validation-data.js'),'utf8');
const labDataCode=fs.readFileSync(path.join(__dirname,'..','m01-learning-lab-data.js'),'utf8');
const appCode=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
function storageFrom(initial={}){const values=new Map(Object.entries(initial));return{getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};}
function drillInput(value){return{value,disabled:false,dataset:{labDrill:'m01-drill-system'},listeners:[],addEventListener(type,cb){if(type==='change')this.listeners.push(cb);}};}
function dispatchChange(input){if(input.disabled)return;for(const cb of input.listeners)cb({target:input,currentTarget:input});}

test('M01 cold drill freezes the first choice after feedback instead of allowing answer replacement',()=>{
  const first=drillInput('escalate-dev'); const second=drillInput('track-dependency'); const main={innerHTML:'',focus(){}}; const sidebar={innerHTML:''}; const mobile={classList:{remove(){},toggle(){return false;}}}; const menu={addEventListener(){},setAttribute(){}};
  const document={querySelector(sel){if(sel==='#main')return main;if(sel==='#sidebar-progress')return sidebar;if(sel==='#mobile-nav')return mobile;if(sel==='#menu-button')return menu;return null;},querySelectorAll(sel){if(sel==='[data-lab-drill]')return[first,second];if(sel==='[data-lab-drill="m01-drill-system"]')return[first,second];return[];}};
  const localStorage=storageFrom();
  const window={PM01MasteryV7:{LESSON_SKILLS:{'project-system':['work']},SKILLS:{work:{id:'work',name:'Работа'}},derive(){return{skills:{work:{id:'work',name:'Работа',level:0,label:'Не встречал',evidence:[]}},counts:{understood:0,applied:0,proved:0}};},nextEvidence(){return'Прими решение.';}},PM01ModulePracticeV7:{definition(){return null;}},PM01ThemeV7:{bind(){}},addEventListener(){},scrollTo(){}};
  const context={window,document,localStorage,location:{hash:'#/lesson/project-system',href:''},console,Blob,URL,Date,setTimeout(){return 1;},clearTimeout(){}};
  vm.createContext(context); vm.runInContext(courseDataCode,context); vm.runInContext(validationDataCode,context); vm.runInContext(labDataCode,context); vm.runInContext(appCode,context);
  dispatchChange(first); assert.equal(first.disabled,true); assert.equal(second.disabled,true); dispatchChange(second);
  const stored=JSON.parse(localStorage.getItem('pm01-state-v1')); assert.equal(stored.lab['project-system'].drillAnswers['m01-drill-system'],'escalate-dev');
});
