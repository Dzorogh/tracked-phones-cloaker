import { PhoneNumbersParser } from "./PhoneNumberParser"
import type { Config, PhonesMap, WrappersSet } from "./types"
import { Calltracking } from "./types"
import type { PhoneNumberItem } from "./PhoneNumberItem"
import { CalltouchService } from "./CalltrackingServices/CalltouchService"
import type { CalltrackingServiceInterface } from "./CalltrackingServices/CalltrackingServiceInterface"
import { AvantelecomService } from "./CalltrackingServices/AvantelecomService"

export class Processor {
    public timeout = 1000


    private readonly wrappersSet: WrappersSet
    private readonly phonesMap: PhonesMap
    private calltrackingService: CalltrackingServiceInterface


    public constructor(phonesMap: PhonesMap, wrappersSet: WrappersSet, config: Config) {
        this.phonesMap = phonesMap
        this.wrappersSet = wrappersSet

        if (config.calltracking === Calltracking.CALLTOUCH) {
            this.calltrackingService = new CalltouchService(config.calltouchId)
        }

        if (config.calltracking === Calltracking.AVANTTELECOM) {
            this.calltrackingService = new AvantelecomService(config.metrikaCounterId)
        }
    }

    public processAllPhones() {
        // const t0 = performance.now()

        const parser = new PhoneNumbersParser(document.body, this.phonesMap, this.wrappersSet)
        const phones = parser.parseAllPhonesAsNodes()

        phones.forEach((phone) => {
            phone.init()

            phone.onInteraction(async () => {
                await this.replacePhone(phone)
            })
        })

        // const t1 = performance.now()
        // console.log(`Parsing phones take ${Math.round(t1 - t0)} milliseconds.`)

        // const t2 = performance.now()
        // console.log(`Formatting phones take ${Math.round(t2 - t1)} milliseconds.`)

        return phones
    }

    public async replacePhone(phoneItem: PhoneNumberItem) {
        // console.log('Replacing')

        await this.calltrackingService
            .whenLoaded(this.timeout)
            .then(async (service) => {
                console.log('start replacing')

                const trackedPhone = (await service.getReplacementPhone(phoneItem.getDigits(), this.timeout))
                    ?? phoneItem.getDigits()

                const siblings = this.phonesMap.get(phoneItem.getInitialDigits())

                if (siblings) {
                    for (const sibling of siblings) {
                        sibling.revealPhone(trackedPhone)
                    }
                }
            })
    }
}
