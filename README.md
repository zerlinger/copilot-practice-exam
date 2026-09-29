# GH-300 Practice Exam

Open `index.html` in any modern browser. No installation, server, or internet connection is needed. Keep all files in this folder together.

Choose beginning (1–300), end (300–1), or randomized order, then start. Single-answer questions are graded when clicked. Multiple-answer questions require the indicated number of choices and Submit answer. The score requires an exact answer match; no partial credit.

Feedback appears for four seconds before advancing. Uncheck automatic advancement before starting to move manually, or pause during feedback. At the end, review missed questions and their correct answers. Starting again or refreshing resets the current score.

Question wording and answer keys come from the three supplied Markdown files; they have not been independently fact-checked. Markdown emphasis is removed to avoid revealing bolded correct answers. Source question numbers remain visible even in randomized mode.

To regenerate questions after editing the source files, run `node build.cjs "C:\path\to\source-files"` from this folder (defaults to your Downloads folder). The builder verifies 300 sequential question IDs and valid answer references.
