# hcow-announcement

Sanitize pneumonia data from [HEALTH COMMISSION OF WENZHOU](http://wjw.wenzhou.gov.cn/) announcements.

## How to use?

### Parsing Manually

- Download announcement from HCOW website and create a file in `src/assets/` folder with date as its name(e.g. **2020-01-01**).
- Run command `npx ts-node scripts/auto-parse.ts` in CLI.
- Check the result in the `dist` folder.

### Parsing Automatically

- Run command `npx ts-node scripts/auto-fetch.ts` in CLI.
- Check the result in the `dist` folder.
