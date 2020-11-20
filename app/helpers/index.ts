import md5 from "md5";
import { v1 as uuidv1 } from 'uuid';
/**
 * 生成当前时间信息
 */
export function currentTime() {
    const dateInstance = new Date();
    let year = dateInstance.getFullYear();
    let month = dateInstance.getMonth() + 1;
    let date = dateInstance.getDate();
    let minutes = dateInstance.getMinutes();
    let seconds = dateInstance.getSeconds();

    let dateStr = date < 10 ? '0' + date : date + '';
    let minutesStr = minutes < 10 ? '0' + minutes : minutes + '';
    let secondsStr = seconds < 10 ? '0' + seconds : seconds + '';
    let monthStr = month < 10 ? '0' + month : month + '';
    return { yearStr: year, dateStr, minutesStr, secondsStr, monthStr, ms: dateInstance.getMilliseconds() }
}
/**
 * 生成重复名称
 * @param name 
 */
export function createRepeatName(name: string) {
    let { yearStr, monthStr, dateStr, ms } = currentTime();
    return name + '_' + yearStr + monthStr + dateStr + '_' + ms
}

/**
 * 根据文件信息生成hash
 * @param name 
 * @param size 
 * @param modifyDate 
 */
export function createFileHash(name: string, size: number, modifyDate: number) {
    return md5(name + size + modifyDate);
}

/**
 * 保留两位小数
 * @param decimal 
 */
export function twoDecimal(decimal: number): number {
    console.log('decimal：' + decimal)
    return Math.round(decimal * 100) / 100;
}

/**
 *生成UUID
 * @export
 * @returns {string}
 */
export function createUUID():string {
    return uuidv1({
        node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
        clockseq: 0x1234,
        msecs: new Date().getTime(),
        nsecs: 5678,
    })
}