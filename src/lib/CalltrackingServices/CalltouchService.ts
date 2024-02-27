import type {CalltrackingServiceInterface} from "./CalltrackingServiceInterface"
import {PluginDetector} from "../PluginDetector"
import type {CTPool} from "../types"

export class CalltouchService implements CalltrackingServiceInterface {
    private ct: any
    private readonly id: string

    public constructor(ctId: string) {
        this.id = ctId
    }

    public async whenLoaded(timeout: number) {
        const detector = new PluginDetector()

        const timeouter = new Promise((resolve) => {
            setTimeout(() => resolve(false), timeout)
        })

        const waiter = detector.awaitForWindowObject('ct')

        const result = await Promise.race([timeouter, waiter])

        console.log('CT finished loading', result)

        if (result) {
            this.ct = result
            return this
        } else {
            this.ct = undefined
            return this
        }
    }

    public async getReplacementPhone(searchablePhone: string, timeout: number) {
        if (!this.ct) {
            console.error('Calltouch not loaded')
            return null
        }

        const replacementPhone = this.dynamicReplacement([searchablePhone]) as unknown as string

        const timeouter = new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), timeout)
        })

        const result = await Promise.race([timeouter, replacementPhone])

        console.log('Race result', result)

        return result ?? null
    }

    private dynamicReplacement(subPoolNamesContains: string[]) {
        return new Promise((resolve) => {
            this.ct(this.id, 'dynamic_replacement', {
                callback: (success: boolean, data: CTPool[]) => {
                    if (data && data[0]) {
                        const newPhoneNumber = data[0].phoneNumber as string
                        return resolve(newPhoneNumber)
                    } else {
                        console.error('Incorrect response from Calltouch')
                        return resolve(null)
                    }
                },
                subPoolNamesContains
            })
        })
    }
}
