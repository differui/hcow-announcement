import { resolve as resolvePath } from 'path';
import jieba from 'nodejieba';

const PreprocessMap = {
  // miscut by jieba
  曾: '曾，', // 曾在武 汉
  日: '日，', // 日出 现..
  无: '无，', // 无胃 寒
  出现: '出现，', // 出 现有
  湖南: '湖南，', // 湖 南回
  感染来源: '感染来源，',
  瑞安市: '瑞安市，',

  // punctuations
  ',': '',
  '。': '',
  '、': '',
  '，': '',
  '（': '',
  '）': '',
  '℃': '',
  '\\s': '',
  '\\(': '',
  '\\)': '',

  // mealess words
  的: '',
  市: '',
  稍: '',
  兼: '',
  被: '',
  等: '',
  伴: '',
  患者: '',
  发病: '',
  其他: '',
  明显: '',
  症状: '',
  上午: '',
  下午: '',
  中午: '',
  晚上: '',
  开始: '',
  '[一二三四五六七八九十]+': '',
  不适: '',
  现住: '',
  多: '',
  少: '',
  偶: '',
  长期: '',
  轻度: '',
  少许: '',
  最高: '',
  密切: '',
  轻微: '',
  严重: '',
  阵发性: '',

  // typo
  世茂店: '世贸店',
  出出现: '出现',
};

const TokenMap = {
  男性: '男',
  女性: '女',
  温: '温州',
  自: '从',
  来自: '从',
  跟: '与',
  感: '出现',
  自感: '出现',
  回: '到',
  自驾: '到',
  到达: '到',
  返回: '到',
  返: '到',
  前往: '到',
  以及: '及',
  测体温: '体温',
  出现: '有',
  自觉: '有',
  提示: '有',
  显示: '有',
  现在: '在',
  咳嗽无痰: '干咳',
  确诊病人: '确诊病例',
  疑似病人: '疑似病例',
  隔离中的病例: '隔离病例',
  回乡人员: '返乡人员',
  返温人员: '返乡人员',
  返瑞人员: '返乡人员',

  居住: '居住史',
  接触: '接触史',
  旅行: '旅行史',
  旅游: '旅行史',
  旅游史: '旅行史',
  外出史: '旅行史',
  旅居史: '居住史',
  生活史: '居住史',

  购物: '购物史',
  聚餐: '聚餐史',
  '有.+': '有',
  '无.+': '无',
  荆门市: '荆门',
  武汉市: '武汉',
  温州市: '温州',
  鹿城区: '鹿城',
  瓯海区: '瓯海',
  龙湾区: '龙湾',
  洞头区: '洞头',
  乐清市: '乐清',
  瑞安市: '瑞安',
  龙港市: '龙港',
  永嘉县: '永嘉',
  平阳县: '平阳',
  苍南县: '苍南',
  文成县: '文成',
  泰顺县: '泰顺',
  银泰: '银泰世贸店',
  银泰百货: '银泰世贸店',
  世贸店: '',
};

const PostprocessSet: string[] = [];

jieba.load({
  userDict: resolvePath(process.cwd(), './src/dicts/user.utf8'),
  stopWordDict: resolvePath(process.cwd(), './src/dicts/stop.utf8'),
});

export function cut(fragment: string) {
  const ageToken: string[] = [];
  const dateToken: string[] = [];
  const temperatureToken: string[] = [];

  for (const [key, value] of Object.entries(PreprocessMap)) {
    fragment = fragment.replace(new RegExp(key, 'g'), value);
  }
  return (jieba.cut(fragment, true) as string[])
    .map((f: string) => {
      if (new RegExp(`^(?:${PostprocessSet.join('|')})$`).test(f)) {
        return;
      }
      for (const [key, value] of Object.entries(TokenMap)) {
        if (new RegExp(`^${key}$`).test(f)) {
          return value;
        }
      }
      if (/\d+/.test(f)) {
        if (temperatureToken[0] === '体温') {
          const next = `${f}度`;

          temperatureToken.length = 0;
          return next;
        } else if (dateToken.length) {
          dateToken.push(f);
          return;
        } else {
          ageToken.push(f);
          dateToken.push(f);
          return;
        }
      }
      if (/^(?:年|月|日)$/.test(f)) {
        console.assert(dateToken.length);
        dateToken.push(f);
        if (f !== '日') {
          return;
        }

        const next = dateToken.join('');

        dateToken.length = 0;
        return next;
      }
      if (f === '岁') {
        console.assert(ageToken.length);
        const next = `${ageToken[0]}岁`;

        ageToken.length = 0;
        dateToken.length = 0;
        return next;
      }
      if (f === '体温') {
        temperatureToken.push(f);
        return;
      }
      return f;
    })
    .map((f: string, index: number, fragments: string[]) => {
      if (fragments[index + 1] === f) {
        return undefined;
      }
      return f;
    })
    .filter(Boolean);
}
