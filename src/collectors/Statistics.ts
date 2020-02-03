import { Collector } from '../type';

export class Statistics extends Collector {
  private date: Date;
  private confirmedCount = 0;
  private curedCount = 0;
  private newCuredCount = 0;
  private severeCount = 0;
  private traceCount = 0;
  private unobservationCount = 0;
  private observationCount = 0;
  private newConfirmedCount = 0;
  private newSevereCount = 0;

  private parseCount(fragment: string) {
    return parseInt(fragment) || 0;
  }

  private parseDate(year: string, month: string, day: string) {
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  public parse(message: string) {
    const date =
      message.match(/^(?:(\d+)年(\d+)月(\d+)日)/) ??
      message.match(/^截至(\d+)月(\d+)日24时/) ??
      message.match(/^截至(?:(\d+)年)(\d+)月(\d+)日24时/);
    const confirmedCount = message.match(
      /累计报告新型冠状病毒感染的?肺炎确诊病例(\d+)例/
    );
    const severeCount = message.match(/，重症病例(\d+)例/);
    const curedCount = message.match(/累计出院(\d+)例/);
    const traceCount = message.match(/密切接触者(\d+)人/);
    const unobservationCount = message.match(/解除医学观察(\d+)人/);
    const observationCount = message.match(/尚有(\d+)人/);
    const newCuredCount = message.match(/新增出院病例(\d+)例/);
    const newSevereCount = message.match(/，新增重症病例(\d+)例/);
    const newConfirmedCount = message.match(
      /新增新型冠状病毒感染的肺炎确诊病例(\d+)例/
    );

    if (date && !this.date)
      this.date =
        date.length === 4
          ? this.parseDate(date[1], date[2], date[3])
          : this.parseDate('2020', date[1], date[2]);
    if (confirmedCount)
      this.confirmedCount = this.parseCount(confirmedCount[1]);
    if (severeCount) this.severeCount = this.parseCount(severeCount[1]);
    if (curedCount) this.curedCount = this.parseCount(curedCount[1]);
    if (traceCount) this.traceCount = this.parseCount(traceCount[1]);
    if (unobservationCount)
      this.unobservationCount = this.parseCount(unobservationCount[1]);
    if (observationCount)
      this.observationCount = this.parseCount(observationCount[1]);
    if (newCuredCount) this.newCuredCount = this.parseCount(newCuredCount[1]);
    if (newSevereCount)
      this.newSevereCount = this.parseCount(newSevereCount[1]);
    if (newConfirmedCount)
      this.newConfirmedCount = this.parseCount(newConfirmedCount[1]);
  }

  public validate() {
    return '';
  }

  public toJS() {
    return {
      date: this.date,
      confirmedCount: this.confirmedCount,
      curedCount: this.curedCount,
      severeCount: this.severeCount,
      traceCount: this.traceCount,
      unobservationCount: this.unobservationCount,
      observationCount: this.observationCount,
      newSevereCount: this.newSevereCount,
      newCuredCount: this.newCuredCount,
      newConfirmedCount: this.newConfirmedCount,
    };
  }
}
