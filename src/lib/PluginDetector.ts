export class PluginDetector {
    private iterations = 0
    private interval: ReturnType<typeof setInterval> = undefined

    public awaitForWindowObject = (param: string) => {
        return new Promise((resolve, reject) => {
            this.interval = setInterval(() => {
                if (window[param]) {
                    clearInterval(this.interval)
                    resolve(window[param])
                }

                if (this.iterations > 1000) {
                    clearInterval(this.interval)
                    reject()
                }
            }, 50)
        })
    }
}
