let logEnabled = false;

export function setLogEnabled(setting: boolean) {
    logEnabled = setting;
}

export function log(...args: unknown[]) {
    if (logEnabled) {
        console.log(...args);
    }
}
