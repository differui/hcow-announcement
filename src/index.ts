import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { Announcement } from './collectors/Announcement';

async function main() {
  const cwd = process.cwd();
  const fileNames = readdirSync(resolvePath(cwd, 'assets/'));
  const files = fileNames.map(name =>
    readFileSync(resolvePath(cwd, `assets/${name}`)).toString('utf-8')
  );

  const announcements = files.map(content => {
    const announcement = new Announcement();

    announcement.parse(content);
    return announcement;
  });

  announcements.forEach(announcement => {
    const validateMessage = announcement.validate();

    if (validateMessage) {
      throw validateMessage;
    }

    const js = announcement.toJS();
    const date = js.stastistic.date;
    const name = `${date.getFullYear()}-${date.getMonth() +
      1}-${date.getDate()}`;

    writeFileSync(resolvePath(cwd, `dist/${name}.json`), JSON.stringify(js));
  });

  writeFileSync(
    resolvePath(cwd, 'dist/summary.json'),
    JSON.stringify(announcements)
  );
}

main();
