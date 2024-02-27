import {setupPhoneWrapper} from "./lib/PhoneWrapper"
import {Processor} from "./lib/Processor"
import {setupStyle} from "./lib/setupStyle"
import type { PhonesMap, WrappersSet, Config } from "./lib/types"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TrackedPhonesCloaker {
    public constructor(config: Config) {
        setupPhoneWrapper()
        setupStyle()

        const phonesMap: PhonesMap = new Map()
        const wrappersSet: WrappersSet = new Set()

        const processor = new Processor(phonesMap, wrappersSet, config)

        processor.processAllPhones()

        setInterval(() => processor.processAllPhones(), 1000)
    }
}

window['TrackedPhonesCloaker'] = TrackedPhonesCloaker
