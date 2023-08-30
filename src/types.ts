import type {PhoneNumberItem} from "./PhoneNumberItem"

export type PhoneNumber = string

export type PhonesMap = Map<PhoneNumber, Set<PhoneNumberItem>>

export type WrappersSet = Set<PhoneNumberItem['wrapperNode']>

export interface CTPool {
    phoneNumber: string
    subPoolId: number
    subPoolName: string
}

export interface CTParams {
    ctClientId: string // "2200000000094535619",
    ctGlobalId: string // "04922447-6b10-5504-8404-60f44be5e944"
    modId: string // "dq3stqwe",
    siteId: number // 55396,
    sessionId: number // 180836169,
    phonesAndSubpools: CTPool[]
}
