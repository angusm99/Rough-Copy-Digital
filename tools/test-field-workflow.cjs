const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../open-design-components/field-rules.js');
const sliders = require('../open-design-components/sliding-configs.js');
const parser = require('../open-design-components/quote-parser.js');
const site = () => ({ building: 'HOUSE', material: 'EX WOOD', wall: 'PLASTER', colour: 'WHITE', floor:'GROUND', access:'NO', parking:'NO', barriers:'NO' });
const line = () => ({ ref:'D1', product: 'Hinged door', family: 'hinged', width: 870, height: 2075,
  qty: 1, sizeConfirmed: true, designSelected: true, diagSVG: '<svg/>', glass: '6.38mm Clear Lam',
  handleSide: 'LEFT', openingDirection: 'OPEN OUT', colour: 'WHITE' });
test('imported values require explicit site confirmation', () => {
  const s = site(); assert.equal(rules.siteReady(s), false);
  s.captureConfirmed = rules.fingerprint(s); assert.equal(rules.siteReady(s), true);
  for (const key of ['building','material','wall','colour']) {
    assert.equal(rules.siteReady({ ...s, [key]: '' }), false);
  }
  s.wall = 'CLADDING'; assert.equal(rules.siteReady(s), false);
});
test('new openings still require a material decision and enclosure', () => {
  const s = { ...site(), building: 'NEW', material: '' };
  assert.deepEqual(rules.siteMissing(s), ['Existing material / new opening', 'Enclosure type']);
  s.material = 'NEW OPENING'; s.enclosure = 'NEW BUILDING';
  assert.deepEqual(rules.siteMissing(s), []);
});
test('custom colour needs a name, code remains optional', () => {
  const s = { ...site(), colour: 'SPECIAL', specialColour: 'CUSTOM' };
  assert.deepEqual(rules.siteMissing(s), ['Custom colour name']);
  s.customColour = 'Pebble Grey'; assert.deepEqual(rules.siteMissing(s), []);
});
test('quote type and size alone are not a completed line', () => {
  const l = { product: 'Hinged door', qty: 1, quoteWidth: 870, quoteHeight: 2075 };
  assert.deepEqual(rules.lineMissing(l), ['reference','pick design','final size','glass','colour','handing / lead side','opening direction','confirm line']);
  assert.equal(l.width, undefined);
});
test('size confirmation cannot bypass picking, handing or special specs', () => {
  assert.deepEqual(rules.lineMissing(line(),{},true), []);
  for (const patch of [{designSelected:false}, {handleSide:''}, {openingDirection:''}, {width:-1}, {height:Infinity}, {qty:1.5}, {glass:'4mm Clear'}, {glass:'SPECIAL',customGlass:''}]) {
    assert.ok(rules.lineMissing({ ...line(), ...patch }).length);
  }
});
test('OXXO is exactly fixed sliding sliding fixed, independent of handling', () => {
  assert.equal(sliders.describe('OX'), 'Fixed · Sliding');
  assert.equal(sliders.describe('XO'), 'Sliding · Fixed');
  const svg = sliders.svg('OXXO');
  assert.deepEqual([...svg.matchAll(/data-panel="(.)"/g)].map(m => m[1]), ['O','X','X','O']);
  assert.equal(sliders.svg('bad'), '');
});
test('Elite and Knysna have identical explicit layouts and code-derived reference dimensions', () => {
  const presets = sliders.windowPresets();
  const elite = presets.filter(p => p.system === 'Elite');
  const knysna = presets.filter(p => p.system === 'Knysna');
  assert.equal(elite.length, 17); assert.equal(knysna.length, 17);
  assert.deepEqual(elite.map(p=>[p.W,p.H,p.config]), knysna.map(p=>[p.W,p.H,p.config]));
  const sourceError = elite.find(p => p.sourceCode === 'EHS-3012' && p.config === 'XOX');
  assert.equal(sourceError.W, 2990); // known wrong quote drawing/overall width: 2090
  assert.equal(elite.find(p=>p.sourceCode === 'EHS-1503').H, 290);
  assert.equal(new Set(presets.map(p=>p.code)).size, presets.length);
});
test('sliding windows do not require door safety glass or door handing', () => {
  const l = {...line(), product:'Elite OX', family:'elite', config:'OX', glass:'4mm Clear', handleSide:'', openingDirection:''};
  assert.deepEqual(rules.lineMissing(l,{},true), []);
});
test('quote parser preserves sliding window identity and XO panel order', () => {
  assert.equal(parser.productType('Elite Horiz. Slider-XOX-DOUBLE TRACK').type, 'Elite Sliding Window');
  assert.equal(parser.productType('Knysna horizontal slider').type, 'Knysna Sliding Window');
  assert.equal(parser.productType('Palace XO').type, 'Palace Sliding XO (2 panel)');
});
const doors = require('../open-design-components/door-drawings.js');
const crops = require('../open-design-components/quote-drawing.js');
const fs = require('node:fs');
const vm = require('node:vm');
function workspaceHarness() {
  const html=fs.readFileSync(require('node:path').join(__dirname,'../open-design-components/workspace.html'),'utf8');
  const source=html.slice(html.indexOf('    const STORE_KEY'),html.indexOf('    // ---------- events ----------'));
  const print=html.slice(html.indexOf('    function buildPrintView()'),html.indexOf('    async function exportPDF()'));
  const elements=new Map(), storage=new Map();
  const get=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',scrollIntoView(){}});return elements.get(id);};
  const ctx=vm.createContext({FieldRules:rules,DoorDrawings:doors,QuoteParser:parser,window:{},console,alert(){},confirm:()=>true,
    document:{getElementById:get},localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k),removeItem:k=>storage.delete(k)}});
  vm.runInContext(source+print+'; renderAll=()=>{}; renderEditor=()=>{}; refreshRowChrome=()=>{}; renderSummary=()=>{}; closeEditor=()=>{editingIndex=-1;};',ctx);
  return {run:code=>vm.runInContext(code,ctx),get,storage};
}
test('workspace quote drawing route preserves quoted sizes and prints logistics',()=>{
  const h=workspaceHarness();
  h.run('state={site:'+JSON.stringify({...site(),barriers:'YES'})+',job:{},lines:[]}; state.site.captureConfirmed=FieldRules.fingerprint(state.site);');
  h.run('state.lines=[blankLine('+JSON.stringify({...line(),product:'Selected door',quoteProduct:'Hinged door',quoteCode:'HD-O-60',quoteFamily:'hinged',quoteDiagPNG:'data:image/png;base64,AAAA',quoteWidth:870,quoteHeight:2075})+')]; editingIndex=0; useQuoteDrawing();');
  assert.equal(h.run('state.lines[0].designSource'),'quote');
  assert.equal(h.run('state.lines[0].diagSVG'),'');
  h.run('state.lines[0].quoteDesignConfirmed=FieldRules.quoteDesignFingerprint(state.lines[0]); confirmLine(false); buildPrintView();');
  assert.equal(h.run('lineReady(state.lines[0])'),true);
  assert.equal(h.run('state.lines[0].quoteWidth'),870);
  assert.match(h.get('pNotes').textContent,/chevrons and tape/);
  assert.match(h.get('pBody').innerHTML,/Selected quote drawing/);
});
test('glass policy keeps individual quote values and flags unsafe door glass',()=>{
  const h=workspaceHarness();
  h.run('state.site={glassPolicy:"QUOTE"}; state.lines=[blankLine({product:"Hinged door",family:"hinged",glass:"6mm TSG",quoteGlass:"5mm Clear"}),blankLine({product:"Window",glass:"4mm Clear",quoteGlass:"6mm Clear"})]; applyGlassPolicy();');
  assert.equal(h.run('state.lines[0].glass'),'5mm Clear');
  assert.equal(h.run('state.lines[1].glass'),'6mm Clear');
  assert.ok(h.run('FieldRules.lineMissing(state.lines[0]).includes("safety glass")'));
});
test('line confirmation invalidates on edits but never changes quoted dimensions', () => {
  const l={...line(),quoteWidth:870,quoteHeight:2075}; const s=site();
  assert.deepEqual(rules.lineMissing(l,s),['confirm line']);
  l.lineConfirmed=rules.lineFingerprint(l,s);
  assert.deepEqual(rules.lineMissing(l,s),[]);
  for(const key of ['ref','location','width','height','glass','handleSide','notes']) {
    assert.ok(rules.lineMissing({...l,[key]:'changed'},s).includes('confirm line'));
  }
  assert.equal(l.quoteWidth,870);
});
test('room optional, reference compulsory, logistics require explicit decisions', () => {
  assert.deepEqual(rules.lineMissing({...line(),location:''},{},true),[]);
  assert.ok(rules.lineMissing({...line(),ref:''},{},true).includes('reference'));
  assert.ok(rules.siteMissing({...site(),parking:''}).includes('Parking decision'));
  assert.ok(rules.siteMissing({...site(),floor:'OTHER'}).includes('Floor detail'));
});
test('use quote drawing is deliberate and never bypasses measurement or handing', () => {
  const l={...line(),designSource:'quote',diagSVG:'',quoteDiagPNG:'data:image/png;base64,AAAA'};
  assert.ok(rules.lineMissing(l,{},true).includes('review quote drawing'));
  l.quoteDesignConfirmed=rules.quoteDesignFingerprint(l);
  assert.deepEqual(rules.lineMissing(l,{},true),[]);
  assert.ok(rules.lineMissing({...l,handleSide:'RIGHT'},{},true).includes('review quote drawing'));
  assert.ok(rules.lineMissing({...l,width:null},{},true).includes('final size'));
});
test('hinged chevrons overlay slats and mirrors use a numeric transform', () => {
  const d=doors.find('HD-S-O-60');
  const left=doors.doorSVG({...d,handleSide:'LEFT'});
  const right=doors.doorSVG({...d,handleSide:'RIGHT'});
  assert.ok(left.lastIndexOf('<polyline')>left.lastIndexOf('<line'));
  assert.match(right,/translate\(890,0\) scale\(-1,1\)/);
  assert.notEqual(left,right);
  assert.doesNotMatch(left,/<text/);
});
test('Palace OXXO ignores lock handing and does not require lock fields', () => {
  const d=doors.find('PAL-4-OXXO');
  assert.equal(doors.doorSVG({...d,handleSide:'LEFT'}),doors.doorSVG({...d,handleSide:'RIGHT'}));
  assert.deepEqual(rules.lineMissing({...line(),family:'multislide',product:'Palace OXXO',config:'OXXO',handleSide:'',openingDirection:''},{},true),[]);
  assert.doesNotMatch(doors.doorSVG(d),/<text/);
});
test('open-out is first hinged choice and changing direction selects matching code', () => {
  assert.equal(doors.DOORS.hinged[0].open,'Open out');
  assert.equal(doors.openingVariant(doors.find('HDM-I-60'),'OPEN OUT').code,'HDM-O-60');
  const custom=doors.openingVariant(doors.find('HDPH-O-60'),'OPEN IN');
  assert.ok(custom.code==='' || custom.open==='Open out');
});
test('outer white trim preserves white frame enclosed by black outline and disconnected ink', () => {
  const w=100,h=100,data=new Uint8ClampedArray(w*h*4).fill(255);
  const black=(x,y)=>{const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=0;};
  for(let x=20;x<=70;x++){black(x,10);black(x,80);}
  for(let y=10;y<=80;y++){black(20,y);black(70,y);}
  black(75,50);
  assert.deepEqual(crops.bounds(data,w,h),{x:17,y:7,w:62,h:77});
});
