// import type { PagicMessage } from './PagicLogger.ts';
export class PagicException {
  public logger = 'default';
  public level = 1;
  public msg = '';
  public stack: string | undefined;
  public constructor(logger: string, level: number, msg: string) {
    this.logger = logger;
    this.level = level;
    this.msg = msg;
    Error.captureStackTrace(this, PagicException);
    if (level === 50) {
      this.error();
    }
  }
  private error() {
    console.log(this.level);
    console.log(this.stack);
    // return pagicMessage(this.name, this.msg);
  }
}
