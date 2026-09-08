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
  // Mirror pairs share one card now - the hand is chosen at "Use this", so
  // OX and XO no longer sit next to each other on the page.
  assert.equal(elite.length, 11); assert.equal(knysna.length, 11);
  assert.deepEqual(elite.map(p=>[p.W,p.H,p.config]), knysna.map(p=>[p.W,p.H,p.config]));
  // Every card offering two hands must offer exactly a mirror pair, and a
  // palindrome must never offer a choice there is no difference between.
  for (const p of presets) {
    if (p.hands.length > 1) {
      assert.equal(p.hands.length, 2);
      assert.equal(p.hands[1], p.hands[0].split('').reverse().join(''));
      assert.notEqual(p.hands[0], p.hands[1]);
    } else {
      assert.equal(p.hands[0], p.config);
    }
  }
  // Both hands of every pair must still be reachable, so nothing was dropped.
  const reachable = new Set(presets.filter(p=>p.system==='Elite').flatMap(p=>p.hands));
  assert.ok(reachable.has('OX') && reachable.has('XO'), 'both hands reachable');
  const sourceError = elite.find(p => p.sourceCode === 'EHS-3012' && p.config === 'XOX');
  assert.equal(sourceError.W, 2990); // known wrong quote drawing/overall width: 2090
  assert.equal(elite.find(p=>p.sourceCode === 'EHS-1503').H, 290);
  assert.equal(new Set(presets.map(p=>p.code)).size, presets.length);
});
test('one card per configuration: hands and stiles are chosen, not duplicated', () => {
  // Angus, 2026-09-08: OX beside XO (and 60mm beside 90mm) was "too much
  // traffic on the page". The catalogue must carry the configuration once.
  assert.deepEqual(sliders.baseLayouts, ['OX','OXX','OXXO','OXXXXO']);
  assert.deepEqual(sliders.handsFor('OX'), ['OX','XO']);
  assert.deepEqual(sliders.handsFor('OXXO'), ['OXXO'], 'palindrome offers no choice');
  assert.deepEqual(sliders.handsFor('OXXXXO'), ['OXXXXO']);
  // ...but the full set of real configurations is still enumerable.
  assert.ok(sliders.layouts.includes('XO') && sliders.layouts.includes('XXO'));

  const cards = doors.hingedCards();
  assert.ok(cards.length < doors.DOORS.hinged.length, 'stile duplicates collapsed');
  const multi = cards.filter(c => c.stiles && c.stiles.length > 1);
  assert.deepEqual(multi.map(c => c.code).sort(), ['HD-O','HDD-O']);
  for (const c of multi) assert.deepEqual(c.stiles, [60,90]);
  // A chosen stile must resolve back to the real Bizman code, not a synthetic one.
  assert.equal(doors.withStile(cards.find(c=>c.code==='HD-O'), 90).code, 'HD-O-90');
  assert.equal(doors.withStile(cards.find(c=>c.code==='HD-O'), 60).code, 'HD-O-60');
  // Every hinged entry must still be reachable through some card + stile.
  const reachable = new Set(cards.flatMap(c =>
    (c.stiles || [null]).map(w => (w ? doors.withStile(c, w).code : c.code))));
  for (const d of doors.DOORS.hinged) assert.ok(reachable.has(d.code), d.code + ' unreachable');
});
test('60mm and 90mm stiles do not render identically', () => {
  // They used to: the stile was a flat 30 regardless of the code, so the two
  // cards were visually indistinguishable. Width is geometry, so it survives
  // a black-and-white print of the rough copy.
  const base = { ...doors.find('HD-O-60'), family: 'hinged' };
  const w60 = doors.doorSVG({ ...base, stile: 60 });
  const w90 = doors.doorSVG({ ...base, stile: 90 });
  assert.notEqual(w60, w90);
  assert.match(w60, /stroke-width="60"/);
  assert.match(w90, /stroke-width="90"/);
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
const frames = require('../open-design-components/window-frames.js');
test('continuous side fix and single B-range base have no phantom transoms',()=>{
  const side={W:1800,H:900,cols:2,rows:2,colW:[900,900],rowH:[450,450],types:['TOP','FIXED','FIXED','FIXED'],family:'tophung'};
  side.spans=frames.standardSpans(side);
  assert.deepEqual(frames.panes(side).find(p=>p.c===1),{r:0,c:1,rs:2,cs:1,t:'FIXED'});
  assert.equal(frames.panes(side).length,3);
  const base={...side,W:900,H:1200,colW:[450,450],rowH:[600,600],types:['TOP','TOP','FIXED','FIXED']};
  base.spans=frames.standardSpans(base);
  assert.deepEqual(frames.panes(base).find(p=>p.r===1),{r:1,c:0,rs:1,cs:2,t:'FIXED'});
  assert.equal(frames.panes(base).length,3);
  assert.equal((frames.svg(base,90,120).match(/data-pane=/g)||[]).length,3);
});
test('full fix grids retain intentional splits; changing a merged pane preserves coverage',()=>{
  const p={W:1200,H:1200,cols:2,rows:2,colW:[600,600],rowH:[600,600],types:['FIXED','FIXED','FIXED','FIXED'],family:'fixed'};
  p.spans=frames.standardSpans(p);
  assert.equal(p.spans.length,0); assert.equal(frames.panes(p).length,4);
  p.spans=[{r:0,c:1,rs:2,cs:1}];
  p.types[1]=p.types[3]='TOP';
  assert.equal(frames.panes(p).length,3);
});
test('hinge hardware choice round-trips independently from leaf design',()=>{
  const standard=doors.find('HD-O-60');
  const parliament=doors.withHinges(standard,'PARLIAMENT');
  assert.equal(parliament.hingeType,'PARLIAMENT');
  assert.equal(parliament.code,'HDPH-O-60');
  assert.equal(doors.withHinges(parliament,'STANDARD').code,'HD-O-60');
  const midrail=doors.withHinges(doors.find('HDM-O-60'),'PARLIAMENT');
  assert.equal(midrail.style,'midrail'); assert.equal(midrail.hingeType,'PARLIAMENT');
  const l={...line(),hingeType:'STANDARD'}; l.lineConfirmed=rules.lineFingerprint(l);
  assert.ok(rules.lineMissing({...l,hingeType:'PARLIAMENT'}).includes('confirm line'));
});
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
