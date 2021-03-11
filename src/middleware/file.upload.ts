import multer, { diskStorage, FileFilterCallback } from 'multer';
import { v4 as uuid } from 'uuid';


export const fileUpload = multer({
    limits: {fieldSize: 524288},
    storage: diskStorage({
        destination: (
            req: Express.Request, 
            file: Express.Multer.File, 
            cb: (error: Error | null, destination: string) => void): void => {
                cb(null, 'uploads/images');
        },
        filename: (
            req: Express.Request, 
            file: Express.Multer.File, 
            cb: (error: Error | null, destination: string) => void): void => {
                const mimeReg: RegExpExecArray | null = /^image\/(png|jpeg|jpg)$/.exec(file.mimetype);
                mimeReg && mimeReg[1] && cb(null, `${uuid()}.${mimeReg[1]}`);
        }
    }),
    fileFilter: (
        req: Express.Request, 
        file: Express.Multer.File, 
        cb: FileFilterCallback): void => {
            // this is likely unnecessary as the file is never written to disk anyways
            // due to a similar check in 'storage.filename' callback
            const isValid: boolean = /^image\/(png|jpeg|jpg)$/.test(file.mimetype);
            !isValid ? cb(new Error('invalid mimetype')) : cb(null, isValid);
    },
});