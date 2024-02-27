import {PhoneNumbersFormatter} from "./PhoneNumberFormatter"

export class PhoneNumberItem {
    private onInteractionCallbacks: (() => Promise<void>)[] = []
    private readonly wrapperNode: HTMLElement
    private readonly linkNode: HTMLElement
    private readonly initialDigits: string
    private isCloaked = false
    private cloakedAttrName = 'cloaked'
    private isLoading = false
    private loadingAttrName = 'loading'
    private isClickDelayed = false

    public constructor(wrapperNode: HTMLElement, linkNode: HTMLElement) {
        this.wrapperNode = wrapperNode
        this.linkNode = linkNode

        this.initialDigits = this.getDigits()
    }

    public init() {
        this.cloak()
        this.formatTel()
        this.formatText()

        this.addListeners()
    }

    public getWrapperNode(): HTMLElement {
        return this.wrapperNode
    }

    public getLinkNode(): HTMLElement {
        return this.linkNode
    }

    public revealPhone(phone: string) {
        this.setPhone(phone)

        this.formatTel()
        this.formatText()

        this.loadingFinish()
        this.uncloak()

        this.removeHoverListener()
        this.removeClickListener()

        this.finishDelayedClick()
    }

    public getDigits() {
        const formatter = new PhoneNumbersFormatter(this.getText())

        return formatter.getDigits()
    }

    public getInitialDigits() {
        return this.initialDigits
    }

    public onInteraction(cb: () => Promise<void>) {
        this.onInteractionCallbacks.push(cb)
    }

    private getText(): string {
        return this.getWrapperNode().textContent
    }

    private setTel(value: string) {
        this.getLinkNode().setAttribute('href', 'tel:' + value)
    }

    private setText(newValue: string) {
        this.getWrapperNode().textContent = newValue

        return newValue
    }

    private getHref() {
        return this.getLinkNode().getAttribute('href')
    }

    private getFormattedTel(phone: string) {
        const formatter = new PhoneNumbersFormatter(phone)

        return formatter.getFormattedTel()
    }

    private getFormattedText(phone: string) {
        const formatter = new PhoneNumbersFormatter(phone)

        return formatter.getFormattedPhone()
    }

    private formatTel() {
        const formatted = this.getFormattedTel(this.getText())

        this.setTel(formatted)
    }

    private formatText() {
        const formatted = this.getFormattedText(this.getText())

        this.setText(formatted)
    }

    private loadingStart() {
        this.isLoading = true
        this.getWrapperNode().setAttribute(this.loadingAttrName, '')
    }

    private loadingFinish() {
        this.isLoading = true
        this.getWrapperNode().removeAttribute(this.loadingAttrName)
    }

    private setPhone(phone: string) {
        this.setText(this.getFormattedText(phone))
        this.setTel(this.getFormattedTel(phone))
    }

    private async onInteractionTrigger() {
        for await (const cb of this.onInteractionCallbacks) {
            await cb()
        }
    }

    private handleHover = async () => {
        this.removeHoverListener()

        this.loadingStart()

        await this.onInteractionTrigger()

        this.loadingFinish()
    }

    private handleClick = async (e: MouseEvent) => {
        this.startDelayedClick(e)

        if (!this.isLoading) {
            this.loadingStart()
            await this.onInteractionTrigger()
            this.loadingFinish()
        }
    }

    private removeClickListener() {
        this.getWrapperNode().removeEventListener('click', this.handleClick)
    }

    private removeHoverListener() {
        this.getWrapperNode().removeEventListener('mouseenter', this.handleHover)
    }

    private uncloak() {
        this.isCloaked = false

        this.getWrapperNode().removeAttribute(this.cloakedAttrName)
    }

    private cloak() {
        this.isCloaked = true

        this.getWrapperNode().setAttribute(this.cloakedAttrName, '')
    }

    private addListeners() {
        this.getWrapperNode().addEventListener('mouseenter', this.handleHover)
        this.getWrapperNode().addEventListener('click', this.handleClick)
    }

    private startDelayedClick(e: MouseEvent) {
        if (this.isCloaked) {
            e.preventDefault()
            this.isClickDelayed = true
        }
    }

    private finishDelayedClick() {
        if (this.isClickDelayed) {
            location.href = this.getHref()
            this.isClickDelayed = false
        }
    }
}
