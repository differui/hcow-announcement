export abstract class Collector {
  public abstract parse(message: string): Collector;
  public abstract validate(): string | void;
  public abstract toJS(): any;
}
