const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../open-design-components/field-rules.js');
const sliders = require('../open-design-components/sliding-configs.js');
const parser = require('../open-design-components/quote-parser.js');
const site = () => ({ building: 'HOUSE', material: 'EX WOOD', wall: 'PLASTER', colour: 'WHITE' });
const line = () => ({ product: 'Hinged door', family: 'hinged', width: 870, height: 2075,
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
  assert.deepEqual(rules.lineMissing(l), ['pick design','final size','glass','colour','handing / lead side','opening direction']);
  assert.equal(l.width, undefined);
});
test('size confirmation cannot bypass picking, handing or special specs', () => {
  assert.deepEqual(rules.lineMissing(line()), []);
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
  assert.deepEqual(rules.lineMissing(l), []);
});
test('quote parser preserves sliding window identity and XO panel order', () => {
  assert.equal(parser.productType('Elite Horiz. Slider-XOX-DOUBLE TRACK').type, 'Elite Sliding Window');
  assert.equal(parser.productType('Knysna horizontal slider').type, 'Knysna Sliding Window');
  assert.equal(parser.productType('Palace XO').type, 'Palace Sliding XO (2 panel)');
});
