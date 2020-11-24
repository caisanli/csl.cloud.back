// 为保持代码整洁，最好将该函数抽离到单独的文件中
import fs from 'fs';
import { Request } from 'koa';
import multer from 'koa-multer';
import path, { resolve } from 'path';
import { createFileHash } from '.';
import FileType from 'file-type';
import { FileChunkEntity } from 'app/entities/mongodb';
import core from 'file-type/core';
import fileCategory from './fileCategory';
import mime from 'mime';
// 生成上传目录
const uploadPath = path.join(__dirname, '../../', 'uploads');

// multer 上传配置
export const fileUploadOptions = {
    storage: multer.diskStorage({
        destination: (req: Request, file: any, cb: any) => { 
            const body: FileChunkEntity = req.body;
            // 根据文件名称、大小、最后修改时间生成Hash值
            const hashVal = createFileHash(body.name, body.size, body.modifyDate);
            // 用hash值生成切片的目录地址
            const chunkPath = path.join(uploadPath, hashVal, '/');
            // 检查切片目录地址是否存在 不存在就新创建
            if(!fs.existsSync(chunkPath)) 
                fs.mkdirSync(chunkPath, { recursive: true })
            // 将切片文件放到切片目录
            cb(null, chunkPath)
        },
        filename: (req: Request, file: any, cb: any) => { 
            const body = req.body;
            // 根据切片顺序生成新切片文件名
            cb(null, `${ body.chunk }_${ body.name }`)
        }
    }),
    limits: {
        fieldNameSize: 255, // 文件名称长度
        fileSize: 1024 * 1024 * 5 // 限制每片文件的大小
    }
};

/**
 * 清空切片文件夹
 * @param hash 
 */
export function clearChunkDir(hash: string) {
    // 生成切片目录地址
    const chunkPath = path.join(uploadPath, hash, '/');
    const fileNames: string [] = fs.readdirSync(chunkPath);
    fileNames.forEach((name: string) => {
        let chunkFilePath = path.join(uploadPath, hash, name);
        fs.unlinkSync(chunkFilePath);
    });
    fs.rmdirSync(chunkPath);
}

/**
 * 合并文件
 * @param hash 
 * @param filePathName 
 */
export function mergeFile(hash: string, filePathName: string, fileName: string) {
    try {
        // 生成切片目录地址
        const chunkPath = path.join(uploadPath, hash, '/');
        // 获取切片文件名称列表
        const filenames: string[] = fs.readdirSync(chunkPath);
        // 生成新文件的路径
        const filePath = path.join(uploadPath, filePathName);
        // 根据新文件地址生成合成的新文件
        fs.writeFileSync(filePath, '')
        // 开始合成新文件
        filenames.forEach((name, i) => {
            let chunkFilePath = path.join(uploadPath, hash, (i + 1) + '_' + fileName);
            let data = fs.readFileSync(chunkFilePath);
            // 将切片文件写入新文件
            fs.appendFileSync(filePath, data);
            // 删除切片文件
            fs.unlinkSync(chunkFilePath);
        })
        // 删除切片目录
        fs.rmdirSync(chunkPath);
    } catch (error) {
        return Promise.resolve(error);
    }
    return Promise.resolve(true);
}

/**
 * 获取文件类型
 * @param relationPath 
 */
export function getFileMimeType(relationPath: string): Promise<core.FileTypeResult> {
    // 获取文件路径
    const filePath = path.join(uploadPath, relationPath)
    return FileType.fromFile(filePath)
}

/**
 * 删除文件
 * @param relationPath 
 */
export function removeFile(relationPath: string) {
    // 获取文件路径
    const filePath = path.join(uploadPath, relationPath);
    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.log(error)
    }
}

/**
 * 获取文件后缀名
 * @param name 
 */
export function getExtName(name: string): string {
    let ext = path.extname(name);
    return ext ? ext.replace('.', '') : '';
}

/**
 * 获取文件类别
 * @param name 
 */
export function getCategory(name: string) {
    let ext = getExtName(name);
    if(!ext) return '0';
    const category = fileCategory;
    ext = ext.toUpperCase();
    for (const key in category) {
        let val = category[key].find( (val: string) => val === ext)
        if(val) return key;
    }
    return '0';
}

/**
 * 拷贝文件
 * @param targetPath 
 * @param newPath 
 */
export function copyFile(targetPath: string, newPath: string) {
    targetPath = path.join(uploadPath, targetPath)
    newPath = path.join(uploadPath, newPath)
    try {
        // fs.writeFileSync(newPath, fs.readFileSync(targetPath))
        fs.copyFileSync(targetPath, newPath);
    } catch (error) {
        console.log(error)
    }
}

/**
 *获取文件stat信息
 * @export
 * @param {string} relationPath
 * @returns {fs.Stats}
 */
export function getFileStat(relationPath: string): fs.Stats {
    const filePath = path.join(uploadPath, relationPath);
    return fs.statSync(filePath);
}

/**
 *
 * 获取文件mime ex：'application/json'
 * @export
 * @param {string} relationPath
 * @returns {string}
 */
export function getFileMime(relationPath: string): string | false {
    const filePath = path.join(uploadPath, relationPath);
    return mime.getType(filePath);
}

/**
 * 获取文件读取流
 *
 * @export
 * @param {string} relationPath
 * @param {*} opt
 * @returns {fs.ReadStream}
 */
export function getFileStream(relationPath: string, opt: any): fs.ReadStream {
    const filePath = path.join(uploadPath, relationPath);
    return fs.createReadStream(filePath, opt);
}

export function getFileBuffer(relationPath: string, opt: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const filePath = path.join(uploadPath, relationPath);
        const fileStream = fs.createReadStream(filePath, opt);
        let arr = [], len = 0;
        fileStream.on('data', chunk => {
            len += chunk.length;
            arr.push( Buffer.from(chunk));
        });
        fileStream.on('end', () => {
            resolve(Buffer.concat(arr, len));
        })
        fileStream.on('error', err => {
            reject(err)
        })
    })
}