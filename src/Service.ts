import {PhoneNumbersParser} from "./PhoneNumberParser"
import type {PhonesMap, WrappersSet} from "./types"
import type {PhoneNumberItem} from "./PhoneNumberItem"
import {CalltouchService} from "./CalltrackingServices/CalltouchService"

export class Service {
    private readonly wrappersSet: WrappersSet
    private readonly phonesMap: PhonesMap
    private calltouchService: CalltouchService

    public constructor(phonesMap: PhonesMap, wrappersSet: WrappersSet, calltouchId: string) {
        this.phonesMap = phonesMap
        this.wrappersSet = wrappersSet
        this.calltouchService = new CalltouchService(calltouchId, 1000)
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

        await this.calltouchService
            .whenLoaded()
            .then(async (service) => {
                console.log('start replacing')
                // const data = await service.dynamicReplacement([phoneItem.getDigits()])

                // this.calltouchService.whenLoaded().then(async (service) => {
                //     console.log(service.calltrackingParams())
                // })

                const trackedPhone = (await service.getReplacementPhone(phoneItem.getDigits()))
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
