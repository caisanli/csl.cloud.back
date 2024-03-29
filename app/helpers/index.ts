import md5 from "md5";
import { v5 as uuidv5 } from 'uuid';
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
    return Math.round(decimal * 100);
}

/**
 *
 * 生成UUID
 * @export
 * @param {string} name
 * @returns {string}
 */
export function createUUID(name: string):string {
    const MY_NAMESPACE = 'be1e6e6c-2739-4274-8a37-f36f39612699';
    return uuidv5(name, MY_NAMESPACE);
}