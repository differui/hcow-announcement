import {
  Region,
  Gender,
  Source,
  Symptom,
  ContactBy,
  DepartureFrom,
} from '../enums';
import { Collector } from '../type';
import { cut } from '../services/JieBa';

export class Patient extends Collector {
  private name?: string;
  private age: number;
  private arriveAt?: Date;
  private departureFrom?: string;
  private gender: Gender;
  private region: Region = Region.不明;
  private source?: Source;
  private symptom: Symptom[] = [];
  private symptomStartAt?: Date;
  private temperature?: number;

  private parseGender(token: string) {
    if (token.includes('男')) {
      return Gender.Male;
    }
    if (token.includes('女')) {
      return Gender.Female;
    }
  }

  private parseAge(token: string) {
    const matched = token.match(/(\d+)岁/);

    if (matched) {
      return parseInt(matched[1]) || undefined;
    }
  }

  private parseRegion(token: string) {
    if (Object.values(Region).includes(token as Region)) {
      return (token as any) as Region;
    }
  }

  private parseDate(token: string) {
    const [_, year, month, day] = token.match(/(\d+年)?(\d+)月(\d+)日/) ?? [];

    if (month && day) {
      return new Date(
        parseInt(year || '2020'),
        parseInt(month) - 1,
        parseInt(day)
      );
    }
  }

  private parseTemperature(token: string) {
    const [temperature] = token.match(/(\d+.\d+)度/) ?? [];

    if (temperature) {
      return parseFloat(temperature);
    }
  }

  private parsePart(part: string) {
    const context: {
      from: string;
      to: string;
      date: Date;
      positive: boolean;
    } = {
      from: '',
      to: '',
      date: null,
      positive: true,
    };
    const tokens = cut(part);

    //#region  helpers
    const peekNextToken = (at: number) => {
      const nextAt = at + 1;
      return nextAt < tokens.length ? tokens[nextAt] : undefined;
    };
    const peekRestTokens = (
      start: number,
      callback: (token: string) => boolean
    ) => {
      let start_ = start;

      while (peekNextToken(start_)) {
        if (callback(peekNextToken(start_))) {
          break;
        }
        start_ += 1;
      }
    };
    const peekPreviousToken = (at: number) => {
      const previousAt = at - 1;

      return previousAt > 0 ? tokens[previousAt] : undefined;
    };
    //#endregion

    for (const [index, token] of tokens.entries()) {
      if (token === '有') {
        context.positive = true;
        continue;
      } else if (token === '无') {
        context.positive = false;
        continue;
      } else if (token === '从') {
        if (
          Object.values(DepartureFrom).includes(
            peekNextToken(index) as DepartureFrom
          )
        ) {
          context.from = peekNextToken(index);
          continue;
        }
      }

      //#region gender
      {
        const gender = this.parseGender(token);

        if (gender) {
          this.gender = gender;
          continue;
        }
      }
      //#endregion

      //#region age
      {
        const age = this.parseAge(token);

        if (age) {
          this.age = age;
          continue;
        }
      }
      //#endregion

      //#region region
      {
        const region = this.parseRegion(token);

        if (region) {
          this.region = region;
          continue;
        }
      }
      //#endregion

      //#region date
      {
        const date = this.parseDate(token);

        if (date) {
          context.date = date;
          continue;
        }
      }
      //#endregion

      //#region from
      if (
        token === '到' &&
        ['温州', ...Object.values(Region)].includes(peekNextToken(index)) &&
        (Object.values(DepartureFrom).includes(
          peekPreviousToken(index) as DepartureFrom
        ) ||
          context.from)
      ) {
        if (context.date) {
          this.arriveAt = context.date;
        }
        this.departureFrom = peekPreviousToken(index);
        continue;
      }
      //#endregion

      //#region temperature
      {
        const temperature = this.parseTemperature(token);

        if (temperature) {
          this.temperature = temperature;
          continue;
        }
      }
      //#endregion

      //#region symptom
      {
        const token_ = (token as any) as Symptom;

        if (
          context.positive &&
          Object.values(Symptom).includes(token as Symptom) &&
          !this.symptom.includes(token_)
        ) {
          if (context.date && !this.symptomStartAt) {
            this.symptomStartAt = context.date;
          }
          this.symptom.push(token_);
          continue;
        }
      }
      //#endregion

      //#region source
      {
        switch (token) {
          case '银泰世贸店':
            if (peekNextToken(index) === ContactBy.Shopping) {
              this.source = Source.ShoppingInTimeMarket;
            } else {
              this.source = Source.WorkingInTimeMarket;
            }
            break;
          case Source.ContactConfirmedCase:
            peekRestTokens(index, nextToken => {
              if (Object.values(ContactBy).includes(nextToken as ContactBy)) {
                this.source = Source.ContactConfirmedCase;
                return true;
              }
              return false;
            });
            break;
          case Source.ContactSuspectedCase:
            peekRestTokens(index, nextToken => {
              if (Object.values(ContactBy).includes(nextToken as ContactBy)) {
                this.source = Source.ContactSuspectedCase;
                return true;
              }
              return false;
            });
            break;
          case Source.ContactQuarantinedCase:
            peekRestTokens(index, nextToken => {
              if (Object.values(ContactBy).includes(nextToken as ContactBy)) {
                this.source = Source.ContactQuarantinedCase;
                return true;
              }
              return false;
            });
            break;
          case Source.ContactReturnees:
            peekRestTokens(index, nextToken => {
              if (Object.values(ContactBy).includes(nextToken as ContactBy)) {
                this.source = Source.ContactReturnees;
                return true;
              }
              return false;
            });
            break;
          case '感染来源':
            switch (peekNextToken(index)) {
              case Source.UnderInvestigation:
                this.source = Source.UnderInvestigation;
                break;
              case Source.UnKnown:
                this.source = Source.UnKnown;
                break;
            }
            break;
        }
      }
      //#endregion
    }
  }

  public validate() {
    return '';
  }

  public parse(fragment: string) {
    fragment
      .split(/[，|。]/g)
      .filter(Boolean)
      .forEach(part => this.parsePart(part));
    return this;
  }

  public toJS() {
    return {
      name: this.name,
      age: this.age,
      gender: this.gender,
      region: this.region,
      temperature: this.temperature,
      source: this.source,
      symptom: this.symptom,
      symptomStartAt: this.symptomStartAt,
      arriveAt: this.arriveAt,
      departureFrom: this.departureFrom,
    };
  }
}
