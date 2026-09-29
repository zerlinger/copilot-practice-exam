const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor() { this.children = []; this.hidden = false; this.value = ''; this.checked = false; this.classList = {add() {}}; this.listeners = {}; }
  append(...children) { children.forEach(c => { c.parentElement = this; this.children.push(c); }); }
  replaceChildren() { this.children = []; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  focus() {}
}
const elements = new Map();
const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
const inputs = () => get('options').children.flatMap(e => e.children).filter(e => e.name === 'answer');
const context = vm.createContext({ window: {}, document: {getElementById: get, createElement: () => new Element(), querySelectorAll: selector => inputs().filter(e => !selector.includes(':checked') || e.checked)}, setTimeout, clearTimeout, confirm: () => true });
for (const name of ['questions.js', 'app.js']) vm.runInContext(fs.readFileSync(`${__dirname}/${name}`, 'utf8'), context);
const run = code => vm.runInContext(code, context);
assert.equal(context.window.EXAM_QUESTIONS.length, 300);
for (const mode of ['forward', 'reverse', 'random']) {
  get('order').value = mode; get('start').listeners.click();
  assert.equal(run('new Set(queue.map(q => q.id)).size'), 300);
  if (mode !== 'random') assert.equal(run('queue[0].id'), mode === 'forward' ? 1 : 300);
  for (let i = 0; i < 300; i++) {
    const answers = run('queue[index].answers');
    for (const input of inputs()) input.checked = answers.includes(input.value);
    run('grade(); grade()'); // Duplicate events cannot count twice.
    assert.equal(run('answered'), i + 1);
    run('next()');
  }
  assert.equal(run('correct'), 300);
  assert.equal(get('results').hidden, false);
}
get('order').value = 'forward'; get('start').listeners.click();
inputs().find(e => e.value === 'A').checked = true;
run('grade(); next()');
assert.equal(run('correct'), 0);
assert.equal(run('mistakes.length'), 1);
inputs().find(e => e.value === 'A').checked = true;
run('grade()'); // A partial multi-answer selection must not submit.
assert.equal(run('answered'), 1);
inputs().find(e => e.value === 'B').checked = true;
run('grade()'); // Same count but wrong combination earns no credit.
assert.equal(run('answered'), 2);
assert.equal(run('correct'), 0);
assert.equal(run("isCorrect(['A','C'], ['C','A'])"), true);
console.log('Passed: all 300 questions in each order, no repeats, scoring, duplicate submissions, multi-answer grading, and completion.');
