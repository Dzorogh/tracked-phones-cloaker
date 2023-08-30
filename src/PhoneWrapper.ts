export const phoneWrapperTagName = 'tracked-phone'

export class PhoneWrapper extends HTMLElement {
}

export function setupPhoneWrapper() {
    customElements.define(phoneWrapperTagName, PhoneWrapper)
}

