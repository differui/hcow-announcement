import { Region, Gender } from '../enums';
import { Collector } from '../type';

export class Patient extends Collector {
  private name: string;
  private age: number;
  private gender?: Gender;
  private region: Region;
  private symptom: string[];
  private temperature?: number;
  private fromWuHan: boolean;
  private unknownWuHan: boolean;
  private fromOutside: boolean;
  private hasContactFromWuHan: boolean;
  private hasContactPatient: boolean;

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
    switch (fragment) {
      case '鹿城区':
        return Region.LuCheng;
      case '瓯海区':
        return Region.OuHai;
      case '龙湾区':
        return Region.LongWan;
      case '洞头区':
        return Region.DongTou;
      case '乐清市':
        return Region.YueQing;
      case '瑞安市':
        return Region.RuiAn;
      case '龙港市':
        return Region.LongGang;
      case '永嘉县':
        return Region.YongJia;
      case '平阳县':
        return Region.PingYang;
      case '苍南县':
        return Region.CangNan;
      case '文成县':
        return Region.WenCheng;
      case '泰顺县':
        return Region.TaiShun;
      default:
        return undefined;
    }
  }

  private parseSymptom(fragment: string) {
    return fragment.split('、').map(s => s.replace(/(?:症状|等)/g, ''));
  }

  private parseTemperature(fragment: string) {
    return parseFloat(fragment);
  }

  public parse(fragment: string) {
    const age = fragment.match(/(\d+)岁/);
    const gender = fragment.match(/，(男|女)，/);
    const region = fragment.match(/，现住(.*?)，/);
    const symptom = fragment.match(/出现(.*?)，/);
    const temperature = fragment.match(/([3|4]\d\.\d+)℃?/);
    const fromWuHan = fragment.match(/(?:武汉返回温州|武汉回温)/);
    const unknownWuHan = fragment.match(/无武汉旅居史/);
    const fromOutside = fragment.match(/回温/);
    const hasContactFromWuHan = fragment.match(/与武汉回温人员有接触史/);
    const hasContactPatient = fragment.match(/与确诊病例有(密切)?接触史/);

    this.age = age ? this.parseAge(age[1]) : undefined;
    this.gender = gender ? this.parseGender(gender[1]) : undefined;
    this.region = region ? this.parseRegion(region[1]) : undefined;
    this.symptom = symptom ? this.parseSymptom(symptom[1]) : [];
    this.temperature = temperature
      ? this.parseTemperature(temperature[1])
      : undefined;
    this.fromWuHan = !!fromWuHan;
    this.unknownWuHan = !!unknownWuHan;
    this.fromOutside = !!fromOutside;
    this.fromOutside = !!fromOutside;
    this.hasContactFromWuHan = !!hasContactFromWuHan;
    this.hasContactPatient = !!hasContactPatient;
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
      unknownWuHan: this.unknownWuHan,
      temperature: this.temperature,
      fromWuHan: this.fromWuHan,
      fromOutside: this.fromOutside,
      hasContactFromWuHan: this.hasContactFromWuHan,
      hasContactPatient: this.hasContactPatient,
    };
  }
}
