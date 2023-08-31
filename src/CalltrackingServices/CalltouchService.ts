import type {CalltrackingServiceInterface} from "./CalltrackingServiceInterface"
import {PluginDetector} from "../PluginDetector"
import type {CTPool} from "../types"

export class CalltouchService implements CalltrackingServiceInterface {
    private ct: any
    private readonly id: string

    public constructor(ctId: string) {
        this.id = ctId
    }

    public async whenLoaded(timeout) {
        const detector = new PluginDetector()

        const timeouter = new Promise((resolve) => {
            setTimeout(() => resolve(false), timeout)
        })

        const waiter = detector.awaitForWindowObject('ct')

        const result = await Promise.race([timeouter, waiter])

        if (result) {
            this.ct = result
            return this
        } else {
            this.ct = undefined
            return this
        }
    }

    public async getReplacementPhone(searchablePhone: string) {
        const data = await this.dynamicReplacement([searchablePhone])

        return data && data[0] ? data[0].phoneNumber : undefined
    }

    private dynamicReplacement(subPoolNamesContains: string[]) {
        return new Promise((resolve) => {
            if (!this.ct) {
                resolve(undefined)
            } else {
                this.ct(this.id, 'dynamic_replacement', {
                    callback: (success: boolean, data: CTPool[]) => {
                        resolve(data)
                    },
                    subPoolNamesContains
                })
            }
        })
    }
}
