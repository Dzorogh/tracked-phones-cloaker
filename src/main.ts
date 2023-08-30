import {setupPhoneWrapper} from "./PhoneWrapper"
import {Service} from "./Service"
import {setupStyle} from "./setupStyle"
import type {PhonesMap, WrappersSet} from "./types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TrackedPhonesCloaker {
    public constructor({calltouchId}: { calltouchId: string }) {
        setupPhoneWrapper()
        setupStyle()

        const phonesMap: PhonesMap = new Map()
        const wrappersSet: WrappersSet = new Set()

        const service = new Service(phonesMap, wrappersSet, calltouchId)

        service.processAllPhones()

        setInterval(() => service.processAllPhones(), 1000)
    }
}
