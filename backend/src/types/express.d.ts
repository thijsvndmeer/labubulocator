// This extends the Request type from Express to include Multer's 'file' property.
declare namespace Express {
  export interface Request {
    file?: Express.Multer.File;
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
  }
}
