const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const appCode=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
function storageFrom(initial={}){const values=new Map(Object.entries(initial));return{getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};}
function classListStub(){return{add(){},remove(){},toggle(){return false;}};}
function lab(id){return{skillId:'work',skill:'Рабочий навык',mission:'Прими решение, затем зафиксируй проверяемое доказательство на реальном проекте.',terms:[],drills:[{id:`${id}-d1`,stage:'cold',required:true,title:'Кейс',situation:'Рабочая ситуация с несколькими правдоподобными действиями.',prompt:'Что сделаешь?',options:[{id:'ok',label:'Сильный ход',feedback:'Ход проверяет механизм до вмешательства.',score:3}]}],workedExample:{title:'Пример',steps:['Шаг 1','Шаг 2','Шаг 3']},technique:{name:'Техника',purpose:'Цель',steps:['Шаг 1','Шаг 2','Шаг 3'],model:'Модель'},workbookTitle:'Рабочая карта',workbookFields:[{id:'field1',label:'Доказательство',prompt:'Запиши факт',required:true}],transferPrompt:'Перенеси на реальный проект.'};}

function runBaseApp(route,storedState={}){
  const main={innerHTML:'',focus(){}}; const sidebar={innerHTML:''}; const mobileNav={classList:classListStub()}; const menu={addEventListener(){},setAttribute(){}}; const notes={value:''};
  const complete={disabled:false,listeners:{},addEventListener(t,cb){this.listeners[t]=cb;}}; const save={addEventListener(){}}; const toast={textContent:'',classList:classListStub()};
  const document={querySelector(sel){if(sel==='#main')return main;if(sel==='#sidebar-progress')return sidebar;if(sel==='#mobile-nav')return mobileNav;if(sel==='#menu-button')return menu;if(sel==='#lesson-notes')return notes;if(sel==='#complete-lesson')return complete;if(sel==='#save-notes')return save;if(sel==='#toast')return toast;return null;},querySelectorAll(){return[];}};
  const lessons=[
    {id:'a',title:'Урок A',thesis:'Тезис A',minutes:10,body:[],model:'',practice:[],criteria:[],learningLab:lab('a')},
    {id:'b',title:'Урок B',thesis:'Тезис B',minutes:10,body:[],model:'',practice:[],criteria:[],learningLab:lab('b')},
  ];
  const window={PM01:{flows:[],diagnostics:[],tools:[],modules:[{id:'m02',title:'Модуль 2',duration:'1 ч',outcome:'Результат',lessons}]},PM01MasteryV7:{LESSON_SKILLS:{a:['work'],b:['work']},SKILLS:{work:{id:'work',name:'Работа'}},derive(){return{skills:{work:{id:'work',name:'Работа',level:0,label:'Не встречал',evidence:[]}},counts:{understood:0,applied:0,proved:0}};},nextEvidence(){return'Прими решение.';}},PM01ModulePracticeV7:{definition(){return{decisions:[]};},isComplete(){return false;},proofFor(){return{};},mergeProof(){return{};}},addEventListener(){},scrollTo(){}};
  const localStorage=storageFrom({'pm01-state-v1':JSON.stringify({completed:[],notes:{},criteria:{},lastLesson:null,diagnostic:{},lab:{},practice:{},...storedState})});
  const location={hash:`#/${route}`,href:''}; const context={window,document,localStorage,location,console,Blob,URL,setTimeout(){return 1;},clearTimeout(){},Date};
  vm.createContext(context); vm.runInContext(appCode,context,{filename:'app.js'}); return{main,complete,location,localStorage};
}

test('lesson completion stays unavailable until decision and workbook evidence exist',()=>{const{main}=runBaseApp('lesson/a');assert.match(main.innerHTML,/0\/1 решений/);assert.match(main.innerHTML,/0\/1 evidence/);assert.match(main.innerHTML,/id="complete-lesson"[^>]*disabled/);});

test('completing a ready first lesson records progress and advances to lesson two',()=>{const{complete,location,localStorage}=runBaseApp('lesson/a',{lab:{a:{drillAnswers:{'a-d1':'ok'},workbook:{field1:'fact'}}}});assert.equal(typeof complete.listeners.click,'function');complete.listeners.click();const saved=JSON.parse(localStorage.getItem('pm01-state-v1'));assert.deepEqual(saved.completed,['a']);assert.equal(location.href,'#/lesson/b');});

test('course view presents one three-step module path',()=>{const{main}=runBaseApp('course');assert.match(main.innerHTML,/Учебный путь/);assert.match(main.innerHTML,/Итоговая практика/);assert.doesNotMatch(main.innerHTML,/Не линейный курс/);});
