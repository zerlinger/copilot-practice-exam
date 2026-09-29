const fs = require('node:fs');
const path = require('node:path');
const sourceDir = process.argv[2] || path.join(process.env.USERPROFILE, 'Downloads');
const clean = text => text.replace(/\*\*/g, '').replace(/`/g, '').trim();
const questions = [];
for (let file = 1; file <= 3; file++) {
  const filename = `${String(file).padStart(2, '0')}-practice-test.raw.md`;
  const raw = fs.readFileSync(path.join(sourceDir, filename), 'utf8');
  const blocks = [...raw.matchAll(/^(\d{3})\.\s+([\s\S]*?)(?=^\d{3}\.\s|$(?![\s\S]))/gm)];
  for (const [, id, body] of blocks) {
    const answer = body.match(/\*\*Correct Answer\(s\):\*\*\s*([^\r\n]+)/i);
    if (!answer) throw new Error(`Missing answer: ${id}`);
    const content = body.slice(0, answer.index);
    const options = [...content.matchAll(/^([A-Z])\.\s+([\s\S]*?)(?=^[A-Z]\.\s|$(?![\s\S]))/gm)];
    const question = { id: Number(id), source: file, text: clean(content.slice(0, options[0]?.index)), options: options.map(([, key, text]) => ({key, text: clean(text)})), answers: answer[1].match(/[A-Z]/g) || [] };
    if (question.options.length < 2 || !question.answers.length || question.answers.some(a => !question.options.some(o => o.key === a))) throw new Error(`Invalid question: ${id}`);
    questions.push(question);
  }
}
if (questions.length !== 300 || questions.some((q, i) => q.id !== i + 1)) throw new Error('Expected questions 1–300, exactly once and in order');
fs.writeFileSync(path.join(__dirname, 'questions.js'), `// Extracted from the three provided answer sheets; answer keys preserved.\nwindow.EXAM_QUESTIONS = ${JSON.stringify(questions, null, 2)};\n`);
console.log(`Validated ${questions.length} questions; ${questions.filter(q => q.answers.length > 1).length} have multiple answers.`);
