import { Patient } from './Patient';
import { Statistics } from './Statistics';

export class Announcement {
  private patients: Patient[] = [];
  private stastistic: Statistics = new Statistics();

  public parse(message: string) {
    const fragments = message.split(/\n/).map(f => f.trim());

    fragments.filter(Boolean).forEach(fragment => {
      if (/^患者/.test(fragment)) {
        const patient = new Patient();

        patient.parse(fragment);
        this.patients.push(patient);
      } else {
        this.stastistic.parse(fragment);
      }
    });
  }

  public validate() {
    const { patients, stastistic } = this.toJS();

    if (patients.length !== stastistic.newConfirmedCount) {
      return 'wrong new confirmed count';
    }
  }

  public toJS() {
    return {
      patients: this.patients.map(p => p.toJS()),
      stastistic: this.stastistic.toJS(),
    };
  }
}
