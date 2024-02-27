import type {CalltrackingServiceInterface} from "./CalltrackingServiceInterface"
import {PluginDetector} from "../PluginDetector"

export class AvantelecomService implements CalltrackingServiceInterface {
    private metrika: any
    private metrikaCounterId: string

    public constructor(metrikaCountId: string) {
        this.metrikaCounterId = metrikaCountId
    }

    /**
     * Set timeout for waiting metrika to load
     * returns this
     *
     * @param timeout
     */
    public async whenLoaded(timeout: number) {
        const detector = new PluginDetector()

        const timeouter = new Promise((resolve) => {
            setTimeout(() => resolve(false), timeout)
        })

        const waiter = detector.awaitForWindowObject('ym')

        const result = await Promise.race([timeouter, waiter])

        if (result) {
            this.metrika = result
            return this
        } else {
            this.metrika = undefined
            return this
        }
    }

    /**
     * @param searchablePhone - phone number to search for
     * @param timeout
     * @returns replacement phone number or undefined
     *
     */
    public async getReplacementPhone(searchablePhone: string, timeout: number) {
        const metrikaClientId = await this.getMetrikaClientId()

        console.log(metrikaClientId)

        const timeouter = new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), timeout)
        })

        const result = this.getNumberFromAvantelecom(metrikaClientId, searchablePhone)

        const data = await Promise.race([timeouter, result])

        return data || null
    }

    /**
     * @returns metrika client id or undefined
     * @private
     */
    private getMetrikaClientId(): Promise<string | undefined> {
        return new Promise((resolve) => {
            if (!this.metrika) {
                resolve(undefined)
            } else {
                this.metrika(this.metrikaCounterId, 'getClientID', (clientID: string) => {
                    resolve(clientID)
                })
            }
        })
    }

    private async getNumberFromAvantelecom(metrikaClientId: string, searchablePhone: string) {
        const url = `https://calltracker.avantele.com/make-reservation/${metrikaClientId}/${searchablePhone}/`

        try {
            const response = await fetch(url)

            const data = await response.json() as {
                "client_id": string
                "created_at": number
                "expires_at": number
                "id": number
                "number": string // replacement phone number
                "updated_at": number
            }

            return data.number
        } catch (error) {
            console.error('Error:', error)
            return undefined
        }
    }
}
