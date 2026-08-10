declare module "archiver" {
  import { Transform, TransformOptions } from "stream";
  import { ZlibOptions } from "zlib";

  interface CoreOptions {
    zlib?: ZlibOptions;
  }

  type ZipOptions = CoreOptions & TransformOptions;

  export class Archiver extends Transform {
    file(filePath: string, options?: { name?: string }): this;
    finalize(): Promise<void>;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  export class ZipArchive extends Archiver {
    constructor(options?: ZipOptions);
  }
}
