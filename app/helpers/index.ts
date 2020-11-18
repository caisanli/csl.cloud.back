
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

export function createRepeatName(name: string) {
    let { yearStr, monthStr, dateStr, ms } = currentTime();
    return name + '_' + yearStr + monthStr + dateStr + '_' + ms
}