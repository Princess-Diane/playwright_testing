// server.js
import express from 'express';
import fs from 'fs';

const app = express();
app.use('/screenshots', express.static('screenshots'));

app.get('/', (req, res) => {
  let results;
  try {
    results = JSON.parse(fs.readFileSync('test-results.json', 'utf-8'));
  } catch {
    return res.send('<h1>No test results found. Run runTests.js first!</h1>');
  }

  let html = `
    <h1 style="text-align:center;">Playwright Test Dashboard</h1>
    <ul style="list-style:none; padding:0;">
  `;

  results.suites.forEach(suite => {
    suite.tests.forEach(test => {
      html += `
        <li style="border:1px solid #ccc; margin:10px; padding:10px; border-radius:5px;">
          <b>${test.title}</b> - 
          <span style="color:${test.status==='passed' ? 'green':'red'}">
            ${test.status.toUpperCase()}
          </span><br>
          Browser: ${test.project || 'N/A'}<br>
          ${test.attachments?.map(a => `<img src="/screenshots/${a.path}" width="200" style="margin:5px;"/>`).join('')}
        </li>
      `;
    });
  });

  html += '</ul>';
  res.send(html);
});

app.listen(3000, () => console.log('📊 Dashboard running at http://localhost:3000'));