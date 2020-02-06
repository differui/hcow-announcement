export abstract class Collector {
  public abstract parse(message: string): void;
  public abstract validate(): string | void;
  public abstract toJS(): any;
}
