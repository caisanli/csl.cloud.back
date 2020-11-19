// 为保持代码整洁，最好将该函数抽离到单独的文件中
import fs from 'fs';
import { Request } from 'koa';
import multer from 'koa-multer';
import path from 'path';
import { createFileHash } from '.';

const uploadPath = path.join(__dirname, '../../', 'uploads');
export const fileUploadOptions = {
    storage: multer.diskStorage({
        destination: (req: Request, file: any, cb: any) => { 
            const body = req.body;
            const hashVal = createFileHash(body.name, body.size, body.modifyTime);
            const chunkPath = path.join(uploadPath, hashVal, '/');
            if(!fs.existsSync(chunkPath)) 
                fs.mkdirSync(chunkPath, { recursive: true })
            cb(null, chunkPath)
        },
        filename: (req: Request, file: any, cb: any) => { 
            const body = req.body;
            cb(null, `${ body.chunk }_${ body.name }`)
        }
    }),
    limits: {
        fieldNameSize: 255,
        fileSize: 1024 * 1024 * 5
    }
};

export function mergeFile(hash: string, filePathName: string) {
    const chunkPath = path.join(uploadPath, hash, '/');
    const filePath = path.join(uploadPath, filePathName);
    const filenames: string[] = fs.readdirSync(chunkPath);
    console.log('filePath：', filePath)
    console.log('paths：', filenames)
    //生成合成的空文件
    try {
        fs.writeFileSync(filePath, '')
    } catch (error) {
        console.log('创建空文件失败：', error)
    }
    
    filenames.forEach(name => {
        let filePath = path.join(uploadPath, hash, name)
        console.log(filePath);
        try {
            let data = null;
            try {
               data = fs.readFileSync(filePath, 'utf-8')
               console.log(data)
            } catch (error) {
                console.log('读取文件失败...')
            }
            fs.appendFileSync(filePath, data);
        } catch (error) {
            console.log('合并文件失败：', error)
        }
    })
}