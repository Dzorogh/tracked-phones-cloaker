import {setupPhoneWrapper} from "./PhoneWrapper"
import {Processor} from "./Processor"
import {setupStyle} from "./setupStyle"
import type { PhonesMap, WrappersSet, Config } from "./types"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Index {
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

window['Index'] = Index
