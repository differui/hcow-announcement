import { Region, Gender } from '../enums';
import { Collector } from '../type';

export class Patient extends Collector {
  private name: string;
  private age: number;
  private gender?: Gender;
  private region: Region;
  private symptom: string[];
  private startAt: Date;
  private temperature?: number;
  private fromWuHan: boolean;
  private haveNotBeenToWuHan: boolean;
  private fromOutside: boolean;
  private hasVisitInTimeMarket: boolean;
  private hasContactFromWuHan: boolean;
  private hasContactConfirmedCase: boolean;
  private hasContactSuspectedCase: boolean;

  private parseAge(fragment: string) {
    return parseInt(fragment) || undefined;
  }

  private parseGender(fragment: string) {
    switch (fragment) {
      case '男':
        return Gender.Male;
      case '女':
        return Gender.Female;
      default:
        return undefined;
    }
  }

  private parseRegion(fragment: string) {
    if (fragment.includes('鹿城')) {
      return Region.LuCheng;
    }
    if (fragment.includes('瓯海')) {
      return Region.OuHai;
    }
    if (fragment.includes('龙湾')) {
      return Region.LongWan;
    }
    if (fragment.includes('洞头')) {
      return Region.DongTou;
    }
    if (fragment.includes('乐清')) {
      return Region.YueQing;
    }
    if (fragment.includes('瑞安')) {
      return Region.RuiAn;
    }
    if (fragment.includes('龙港')) {
      return Region.LongGang;
    }
    if (fragment.includes('永嘉')) {
      return Region.YongJia;
    }
    if (fragment.includes('平阳')) {
      return Region.PingYang;
    }
    if (fragment.includes('苍南')) {
      return Region.CangNan;
    }
    if (fragment.includes('文成')) {
      return Region.WenCheng;
    }
    if (fragment.includes('泰顺')) {
      return Region.TaiShun;
    }
    if (fragment.includes('浙南产业集聚区')) {
      return Region.TaiShun;
    }
    return undefined;
  }

  private parseSymptom(fragment: string) {
    return fragment.split(/、|和|伴/).map(s => s.replace(/(?:症状|等)/g, ''));
  }

  private parseStartAt(year: string, month: string, date: string) {
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(date));
  }

  private parseTemperature(fragment: string) {
    return parseFloat(fragment);
  }

  public parse(fragment: string) {
    const age = fragment.match(/(\d+)岁/);
    const gender = fragment.match(/，(男|女)性?，?\d/);
    const region = fragment.match(/，现住(.*?)，/);
    const symptom = fragment.match(/(?:出现|发病，)(.*?)，/);
    const startAt = fragment.match(
      /(\d{4}年)?(\d+)月(\d+)日[早中晚]?(?:出现|发病)/
    );
    const temperature = fragment.match(/([3|4]\d\.\d+)℃?/);
    const fromWuHan = fragment.match(
      /(?:[自从]武汉|武汉返?回|离开武汉|武汉人)/
    );
    const haveNotBeenToWuHan = fragment.match(/无武汉(?:外出|旅游|旅居)史/);
    const fromOutside = fragment.match(
      /(来|返?回)(?:温州?|鹿城|瓯海|龙湾|洞头|乐清|瑞安|龙港|永嘉|平阳|苍南|文成|泰顺)/
    );
    const hasVisitInTimeMarket = fragment.match(/银泰/);
    const hasContactFromWuHan = fragment.match(
      /(与|同)武汉(回乡|回温|返乡)人员有接触史/
    );
    const hasContactConfirmedCase = fragment.match(
      /(与|有|为)确诊病[例|人](的.+|有?(?:密切)?接触史|共同居住史)/
    );
    const hasContactSuspectedCase = fragment.match(
      /(与|有)疑似病[例|人]有?(密切)?接触史/
    );

    this.age = age ? this.parseAge(age[1]) : undefined;
    this.gender = gender ? this.parseGender(gender[1]) : undefined;
    this.region = region ? this.parseRegion(region[1]) : undefined;
    this.symptom = symptom ? this.parseSymptom(symptom[1]) : [];
    this.startAt = startAt
      ? this.parseStartAt(startAt[1] ?? '2020', startAt[2], startAt[3])
      : undefined;
    this.temperature = temperature
      ? this.parseTemperature(temperature[1])
      : undefined;
    this.fromWuHan = !!fromWuHan;
    this.haveNotBeenToWuHan = !!haveNotBeenToWuHan;
    this.fromOutside = !!fromOutside;
    this.fromOutside = !!fromOutside;
    this.hasContactFromWuHan = !!hasContactFromWuHan;
    this.hasVisitInTimeMarket = !!hasVisitInTimeMarket;
    this.hasContactConfirmedCase = !!hasContactConfirmedCase;
    this.hasContactSuspectedCase = !!hasContactSuspectedCase;
  }

  public validate() {
    return '';
  }

  public toJS() {
    return {
      name: this.name,
      age: this.age,
      gender: this.gender,
      region: this.region,
      symptom: this.symptom,
      startAt: this.startAt,
      haveNotBeenToWuHan: this.haveNotBeenToWuHan,
      temperature: this.temperature,
      fromWuHan: this.fromWuHan,
      fromOutside: this.fromOutside,
      hasContactFromWuHan: this.hasContactFromWuHan,
      hasVisitInTimeMarket: this.hasVisitInTimeMarket,
      hasContactConfirmedCase: this.hasContactConfirmedCase,
      hasContactSuspectedCase: this.hasContactSuspectedCase,
    };
  }
}
