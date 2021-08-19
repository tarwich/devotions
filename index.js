// @ts-check
const puppeteer = require('puppeteer');
const clipboard = require('clipboardy');

async function main() {
  // Form the search phrase
  const searchPhrase = process.argv
    .slice(2)
    .join(' ')
    .replace(/\s+/g, '+')
    .replace(':', '.');

  const browser = await puppeteer.launch({ headless: true });
  // Create a browser page
  const page = await browser.newPage();
  await page.goto(
    `https://www.biblegateway.com/passage/?search=${searchPhrase}&version=NIV;NET`
  );
  // Page should be loaded. Grab the passage information
  const passage = await (
    await page.$('.passage-display .dropdown-display-text')
  ).evaluate((n) => n.textContent);
  const link = `https://biblegateway.com/passage/?search=${passage
    .replace(/\s+/g, '+')
    .replace(':', '.')}`;
  console.log(`${passage}\n${link}`);
  const translations = [];

  // Enumerate translations
  for (const translationNode of await page.$$('[data-translation]')) {
    const translation = await translationNode.evaluate((n) =>
      n.getAttribute('data-translation')
    );

    const text = await translationNode.evaluate((node) =>
      [...node.querySelectorAll('.passage-text p .text')]
        .map((e) =>
          [...e.childNodes]
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent)
            .join('')
        )
        .join(' ')
        .replace(/\s+/, ' ')
    );
    console.log(`\n\n${translation}\n${text}`);
    translations.push({ translation, text });
  }
  clipboard.writeSync(
    `${passage}\n${link}\n\n${translations.map(
      (t) => `\n\n${t.translation}\n${t.text}`
    )}`
  );

  browser.close();
}

main().catch(console.error);
