import type {CTPool} from "./types"
import {PluginDetector} from "./PluginDetector"

export class CalltouchService {
    private ct: any
    private id: string

    constructor(ctId: string) {
        this.id = ctId
    }


    public async whenLoaded() {
        const detector = new PluginDetector()

        this.ct = await detector.awaitForWindowObject('ct') as any

        return this
    }

    public dynamicReplacement(subPoolNamesContains: string[]) {
        return new Promise((resolve) => {
            this.ct(this.id, 'dynamic_replacement', {
                callback: (success: boolean, data: CTPool[]) => {
                    resolve(data)
                },
                subPoolNamesContains
            })
        })
    }
}
