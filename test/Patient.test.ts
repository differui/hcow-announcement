import { Patient } from '../src/collectors/Patient';
import { Source, Gender, Region, Symptom } from '../src/enums';

test('basic info', () => {
  const patient = new Patient().parse('男，23岁，现住鹿城区');

  expect(patient.toJS().gender).toBe(Gender.Male);
  expect(patient.toJS().age).toBe(23);
  expect(patient.toJS().region).toBe(Region.鹿城);
});

test('source', () => {
  const patient = new Patient();

  expect(patient.parse('与确诊病例有接触史').toJS().source).toBe(
    Source.ContactConfirmedCase
  );
  expect(patient.parse('与疑似病例有居住史').toJS().source).toBe(
    Source.ContactSuspectedCase
  );
  expect(patient.parse('与隔离病例有居住史').toJS().source).toBe(
    Source.ContactQuarantinedCase
  );
  expect(patient.parse('有湖北回乡人员接触史').toJS().source).toBe(
    Source.ContactReturnees
  );
  expect(patient.parse('有银泰世贸店购物史').toJS().source).toBe(
    Source.ShoppingInTimeMarket
  );
  expect(patient.parse('银泰清洁工').toJS().source).toBe(
    Source.WorkingInTimeMarket
  );
  expect(patient.parse('感染来源调查中').toJS().source).toBe(
    Source.UnderInvestigation
  );
});

test('temperature', () => {
  const patient = new Patient().parse('体温37.5℃');

  expect(patient.toJS().temperature).toBe(37.5);
});

test('departure', () => {
  const patient = new Patient().parse('2月1日武汉返回温州');

  expect(patient.toJS().departureFrom).toBe('武汉');
  expect(patient.toJS().arriveAt.getFullYear()).toBe(2020);
  expect(patient.toJS().arriveAt.getMonth()).toBe(1);
  expect(patient.toJS().arriveAt.getDate()).toBe(1);
});

test('symptom', () => {
  const patient = new Patient().parse(
    '2月1日出现咳嗽、没有发热，CT显示肺部感染'
  );

  expect(patient.toJS().symptom.includes(Symptom.咳嗽));
  expect(patient.toJS().symptom.includes(Symptom.肺部感染));
  expect(patient.toJS().symptomStartAt.getFullYear()).toBe(2020);
  expect(patient.toJS().symptomStartAt.getMonth()).toBe(1);
  expect(patient.toJS().symptomStartAt.getDate()).toBe(1);
  expect(!patient.toJS().symptom.includes(Symptom.发热));
});
