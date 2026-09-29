/* No network requests or dependencies: open index.html in a browser. */
const $ = id => document.getElementById(id);
let queue = [], index = 0, correct = 0, answered = 0, locked = false, timer = null, mistakes = [];
function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function isCorrect(selected, answers) {
  return selected.length === answers.length && answers.every(a => selected.includes(a));
}
function stopTimer() { clearTimeout(timer); timer = null; $('pause').hidden = true; }
function stats() {
  $('score').textContent = `Score: ${correct} / ${answered} · ${answered ? Math.round(correct / answered * 100) : 0}%`;
  $('progress').value = answered;
}
function render() {
  stopTimer(); locked = false;
  const q = queue[index];
  $('position').textContent = `Question ${index + 1} of ${queue.length}`;
  $('source').textContent = `PRACTICE TEST ${q.source} / QUESTION ${String(q.id).padStart(3, '0')}`;
  $('question').textContent = q.text;
  $('hint').textContent = q.answers.length > 1 ? `Select ${q.answers.length} answers, then submit. All must match for credit.` : 'Choose one answer to check it immediately.';
  $('options').replaceChildren();
  const legend = document.createElement('legend'); legend.className = 'sr-only'; legend.textContent = 'Answer choices'; $('options').append(legend);
  for (const option of q.options) {
    const label = document.createElement('label'); label.className = 'choice';
    const input = document.createElement('input'); input.type = q.answers.length > 1 ? 'checkbox' : 'radio'; input.name = 'answer'; input.value = option.key;
    const span = document.createElement('span'); span.textContent = `${option.key}. ${option.text}`;
    input.addEventListener('change', () => {
      if (q.answers.length === 1) grade();
      else $('submit').disabled = selected().length !== q.answers.length;
    });
    label.append(input, span); $('options').append(label);
  }
  $('submit').hidden = q.answers.length === 1; $('submit').disabled = true;
  $('feedback').hidden = true; $('next').hidden = true;
  stats(); $('question').focus();
}
function selected() { return [...document.querySelectorAll('#options input:checked')].map(el => el.value); }
function answerText(q, keys) { return q.options.filter(o => keys.includes(o.key)).map(o => `${o.key}. ${o.text}`).join(' • '); }
function grade() {
  if (locked) return;
  const q = queue[index], chosen = selected();
  if (chosen.length !== q.answers.length) return;
  locked = true; answered++;
  const success = isCorrect(chosen, q.answers);
  if (success) correct++; else mistakes.push({q, chosen});
  for (const input of document.querySelectorAll('#options input')) {
    input.disabled = true;
    if (q.answers.includes(input.value)) input.parentElement.classList.add('correct');
    else if (input.checked) input.parentElement.classList.add('wrong');
  }
  $('submit').hidden = true;
  $('feedback').hidden = false; $('feedback').className = success ? 'good' : 'bad';
  $('feedback').textContent = success ? 'Correct! Well done.' : `Incorrect. Correct answer${q.answers.length > 1 ? 's' : ''}: ${answerText(q, q.answers)}`;
  $('next').hidden = false; $('next').textContent = index === queue.length - 1 ? 'See results' : 'Next question';
  stats(); $('next').focus();
  if ($('auto').checked) { $('pause').hidden = false; timer = setTimeout(next, 4000); }
}
function next() {
  if (!locked) return;
  stopTimer();
  if (++index < queue.length) render(); else finish();
}
function finish() {
  $('exam').hidden = true; $('results').hidden = false;
  $('result-title').textContent = `You scored ${correct} / ${queue.length} (${Math.round(correct / queue.length * 100)}%)`;
  $('result-text').textContent = `All ${queue.length} questions completed. ${mistakes.length} incorrect answers.`;
  $('missed').replaceChildren(); $('review').open = false; $('review').hidden = !mistakes.length;
  for (const {q, chosen} of mistakes) {
    const item = document.createElement('div'); item.className = 'review-item';
    for (const text of [`Question ${q.id}: ${q.text}`, `Your answer: ${answerText(q, chosen)}`, `Correct answer: ${answerText(q, q.answers)}`]) {
      const p = document.createElement('p'); p.textContent = text; item.append(p);
    }
    $('missed').append(item);
  }
  $('result-title').focus();
}
function setup() { stopTimer(); $('exam').hidden = true; $('results').hidden = true; $('setup').hidden = false; $('start').focus(); }
$('start').addEventListener('click', () => {
  queue = [...window.EXAM_QUESTIONS];
  if ($('order').value === 'reverse') queue.reverse();
  if ($('order').value === 'random') queue = shuffled(queue);
  index = correct = answered = 0; mistakes = [];
  $('setup').hidden = true; $('results').hidden = true; $('exam').hidden = false; render();
});
$('answer-form').addEventListener('submit', event => { event.preventDefault(); grade(); });
$('next').addEventListener('click', next);
$('pause').addEventListener('click', () => { stopTimer(); $('next').focus(); });
$('restart').addEventListener('click', () => { stopTimer(); if (confirm('Start a new exam? Your current score will be reset.')) setup(); });
$('again').addEventListener('click', setup);
