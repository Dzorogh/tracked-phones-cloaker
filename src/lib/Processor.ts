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

        if (!this.calltrackingService) {
            console.error('No calltracking service selected')
        }
    }

    public processAllPhones() {
        const parser = new PhoneNumbersParser(document.body, this.phonesMap, this.wrappersSet)
        const phones = parser.parseAllPhonesAsNodes()

        phones.forEach((phone) => {
            phone.init()

            phone.onInteraction(async () => {
                await this.replacePhone(phone)
            })
        })

        return phones
    }

    public async replacePhone(phoneItem: PhoneNumberItem) {
        // console.log('Replacing')

        await this.calltrackingService
            .whenLoaded(this.timeout)
            .then(async (service) => {
                console.log('Start replacing')

                let replacementPhone = await service.getReplacementPhone(phoneItem.getDigits(), this.timeout)

                console.log('Replacement Phone', replacementPhone)

                replacementPhone = replacementPhone ?? phoneItem.getDigits()

                const siblings = this.phonesMap.get(phoneItem.getInitialDigits())

                if (siblings) {
                    for (const sibling of siblings) {
                        sibling.revealPhone(replacementPhone)
                    }
                }
            })
    }
}
