export class PhoneNumbersFormatter {
    public phone = undefined

    public constructor(phone) {
        this.phone = phone
    }

    public isFormatted() {
        return !!this.phone.match(/^(.*([ ()-]).*)$/)
    }

    public getDigits() {
        return this.phone.replace(/\D/g, "")
    }

    // formatLinkTel(element: HTMLElement) {
    //     element.setAttribute('href', 'tel:' + this.getDigits())
    // }
    //
    // formatText(element: HTMLElement) {
    //     element.textContent = this.getFormattedPhone()
    // }

    public getFormattedPhone() {
        const phoneDigits = this.getDigits().slice(-10)
        let startsWith = ''

        if (phoneDigits.startsWith('800')) {
            startsWith = '8'
        } else {
            startsWith = '+7'
        }

        return phoneDigits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})$/g, `${startsWith} $1 $2-$3-$4`)
    }
}
