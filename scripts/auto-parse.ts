import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { Announcement } from '../src/collectors/Announcement';
import { dateStr } from '../src/helpers';

async function main() {
  const cwd = process.cwd();
  const fileNames = readdirSync(resolvePath(cwd, 'assets/'));
  const files = fileNames.map(name =>
    readFileSync(resolvePath(cwd, `assets/${name}`)).toString('utf-8')
  );

  const announcements = files.map(content => new Announcement().parse(content));

  announcements.forEach(announcement => {
    const validateMessage = announcement.validate();

    if (validateMessage) {
      console.warn(`WARN: ${validateMessage}`);
    }

    const js = announcement.toJS();
    const date = js.stastistic.date;

    writeFileSync(
      resolvePath(cwd, `dist/${dateStr(date)}.json`),
      JSON.stringify(js, null, 2)
    );
  });
  writeFileSync(
    resolvePath(cwd, 'dist/summary.json'),
    JSON.stringify(announcements, null, 2)
  );
}

main();
