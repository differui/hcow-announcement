import { writeFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { get } from 'http';
import { load } from 'cheerio';
import { scheduleJob } from 'node-schedule';
import { Announcement } from '../src/collectors/Announcement';
import { dateStr } from '../src/helpers';

const PER_MINUTE = '30 * * * * *';
const PER_HOUR = '30 1 * * * *';

const URL_HOST = 'http://wjw.wenzhou.gov.cn';
const URL_HCOW_LISTS = ['http://wjw.wenzhou.gov.cn/col/col1209919/index.html'];

async function downloadUrl(url: string) {
  return new Promise<string>((resolve, reject) => {
    let content = '';

    get(url, res => {
      res.setEncoding('utf-8');
      res.on('data', chunk => (content += chunk));
      res.on('end', () => resolve(content));
      res.on('error', e => reject(e));
    });
  });
}

async function fetchLinks(url: string) {
  const content = await downloadUrl(url);
  const matchLinkRE = /href='([^']+)'\s.*?title='([^']*)'/g;
  const links = [];
  let midResult;

  while ((midResult = matchLinkRE.exec(content))) {
    const [_, link, title] = midResult;

    if (/肺炎疫情通报/.test(title)) {
      links.push(`${URL_HOST}${link}`);
    }
  }
  return links;
}

async function fetchAnnouncement(url: string) {
  const content = await downloadUrl(url);
  const $ = load(content);
  const statements: string[] = $('#zoom p')
    .map((_, p) => $(p).text())
    .get();

  return statements
    .map(s => s.trim())
    .filter(Boolean)
    .join('\n');
}

async function main() {
  const cwd = process.cwd();
  const announcements = [];

  for await (const url of URL_HCOW_LISTS) {
    const links = await fetchLinks(url);

    for await (const link of links) {
      const announcement = new Announcement();
      const content = await fetchAnnouncement(link);

      announcement.parse(content);

      // validate
      const validateMessage = announcement.validate();

      if (validateMessage) {
        console.warn(`WARN: ${validateMessage}`);
      }

      // write to file
      const js = announcement.toJS();
      const date = js.stastistic.date;

      announcements.push(announcement);
      writeFileSync(resolvePath(cwd, `assets/${dateStr(date)}`), content);
      writeFileSync(
        resolvePath(cwd, `dist/${dateStr(date)}.json`),
        JSON.stringify(js)
      );
    }
  }

  writeFileSync(
    resolvePath(cwd, 'dist/summary.json'),
    JSON.stringify(announcements)
  );

  process.stdout.write(`job finished at ${new Date().toLocaleString()}\n`);
}

scheduleJob(PER_HOUR, main);
main();
