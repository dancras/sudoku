let logEnabled = false;

export function setLogEnabled(setting: boolean) {
    logEnabled = setting;
}

export function log(...args: any[]) {
    if (logEnabled) {
        console.log(...args);
    }
}
