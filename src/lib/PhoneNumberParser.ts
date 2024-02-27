import {phoneWrapperTagName} from "./PhoneWrapper"
import {PhoneNumberItem} from "./PhoneNumberItem"
import type {PhonesMap, WrappersSet} from "./types"

export class PhoneNumbersParser {
    private ruPhone = /(?<!\d)((\+7|[,78]) ?(\d{10}|(\(?\d{3}\)? ?\d{3}(?:[ ,\-]?\d{2}){2})))(?!\d)/gim
    // ruPhone = /(^8|7|\+7)((\d{10})|(\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}))/im;
    private excludedTags = ['script', 'jdiv']

    private readonly rootNode: HTMLElement
    private phonesMap: PhonesMap
    private wrappersSet: WrappersSet

    public constructor(rootNode: HTMLElement, phonesMap: PhonesMap, wrappersSet: WrappersSet) {
        this.phonesMap = phonesMap
        this.wrappersSet = wrappersSet

        if (rootNode) {
            this.rootNode = rootNode
        } else {
            this.rootNode = document.body
        }
    }

    public parseAllPhonesAsNodes() {
        const nodesWithPhone = this.findTextNodesWithPhones()

        const wrappedPhones = this.wrapPhones(nodesWithPhone)

        wrappedPhones.forEach(item => {
            this.addPhoneItemToMapAndSet(item)
        })

        return wrappedPhones
    }

    private addPhoneItemToMapAndSet(phoneItem: PhoneNumberItem) {
        const phone = phoneItem.getInitialDigits()

        // wrappers
        this.wrappersSet.add(phoneItem.getWrapperNode())

        // nodes by phone number
        if (this.phonesMap.has(phone)) {
            const existingSet = this.phonesMap.get(phone)
            existingSet.add(phoneItem)
            this.phonesMap.set(phone, existingSet)
        } else {
            this.phonesMap.set(phone, new Set([phoneItem]))
        }
    }

    private wrapPhones(textNodes: Node[]): PhoneNumberItem[] {
        const result = []

        for (let textNode of textNodes) {
            let parentNode = textNode.parentNode as HTMLElement
            const phones = this.getPhoneMatches(textNode.textContent.trim())

            if (parentNode.nodeName.toLowerCase() === phoneWrapperTagName.toLowerCase()) {
                // already wrapped

                if (this.wrappersSet.has(parentNode)) {
                    // console.log('already wrapped correctly');
                    continue
                } else {
                    // console.log('Found broken Phone Wrapper!', parentNode)

                    const result = this.unwrapPhone(parentNode)

                    textNode = result.textNode
                    parentNode = result.parentNode as HTMLElement
                }
            }

            // Не рассматриваем ситуацию,
            // где в одной ссылке может быть несколько номеров телефонов
            if (parentNode.nodeName.toLowerCase() === 'a') {
                // Если телефон найден в ссылке

                const wrapperNode = document.createElement(phoneWrapperTagName)
                wrapperNode.textContent = textNode.textContent
                parentNode.replaceChild(wrapperNode, textNode)

                result.push(
                    new PhoneNumberItem(
                        wrapperNode,
                        parentNode
                    )
                )
            } else if (parentNode.closest('a') && parentNode.closest('a').getAttribute('href').startsWith('tel:')) {
                // Если выше по дереву есть ссылка, проверяем — телефонная ли она.

                const wrapperNode = document.createElement(phoneWrapperTagName)
                wrapperNode.textContent = textNode.textContent
                parentNode.replaceChild(wrapperNode, textNode)

                result.push(
                    new PhoneNumberItem(
                        wrapperNode,
                        parentNode.closest('a')
                    )
                )
            } else {
                // Если это просто номер в тексте

                const newLinkNodes = this.replacePhoneStringsWithLinks(textNode, phones)

                result.push(...newLinkNodes.map((linkNode) => {
                    const wrapperNode = document.createElement(phoneWrapperTagName)
                    wrapperNode.textContent = linkNode.textContent
                    linkNode.textContent = null
                    linkNode.appendChild(wrapperNode)

                    return new PhoneNumberItem(
                        wrapperNode,
                        linkNode
                    )
                }))
            }
        }

        return result
    }


    private getPhoneMatches(text: string) {
        const matches = text.matchAll(this.ruPhone)
        return [...matches].map((match) => match[1])
    }

    // findStrings() {
    //     return this.getPhoneMatches(this.rootNode.innerHTML)
    // }

    //  find all nodes that have phone in text
    //  If node (or ony parent node) is link — return it,
    //  else — wrap number inside node in link and return
    //  returns Iterator
    private findTextNodesWithPhones(): Node[] {

        // Find all text nodes
        const textNodesWalker = document
            .createTreeWalker(this.rootNode, NodeFilter.SHOW_TEXT, (node) =>
                !this.excludedTags.includes(node.parentNode.nodeName.toLowerCase())
                && node.textContent.trim().length > 0
                && this.getPhoneMatches(node.textContent.trim()).length > 0
                    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
            )

        const resultArray = []

        // Make array of nodes, that contains phones in self content
        while (textNodesWalker.nextNode()) {
            resultArray.push(textNodesWalker.currentNode)
        }

        return resultArray
    }

    private makeTelFromPhoneNumber(phone: string) {
        return phone.replace(/\D/g, "")
    }

    /**
     * Will replace ALL phones in text node,
     * even multiple times,
     * for multiple phone numbers,
     * with links and return new links nodes.
     */
    private replacePhoneStringsWithLinks(textNode: Node, phones: string[]) {
        const parentNode = textNode.parentNode

        const resultNodes = [textNode]

        // for each phone split text nodes and make result array
        phones.forEach((phone) => {
            const linkElement = document.createElement('a')
            const tel = this.makeTelFromPhoneNumber(phone)
            linkElement.setAttribute('href', "tel:" + tel)
            linkElement.textContent = phone

            resultNodes.forEach((resultNode, resultNodeIndex) => {
                if (resultNode.nodeType === Node.TEXT_NODE) {
                    const newStrings = resultNode.textContent.split(phone)
                    const newNodes = []

                    newStrings.forEach((newString, index) => {
                        if (newString) {
                            newNodes.push(document.createTextNode(newString))
                        }

                        if (index < newStrings.length - 1) {
                            // if it is not last item — add link element.

                            newNodes.push(linkElement)
                        }
                    })

                    // replace splitted text string with new nodes
                    resultNodes.splice(resultNodeIndex, 1, ...newNodes)
                }
            })
        })

        const resultLinksNodes = []

        resultNodes.forEach((resultNode, resultNodeIndex) => {
            const uniqueNode = resultNode.cloneNode(true)

            if (resultNodeIndex === 0) {
                parentNode.replaceChild(uniqueNode, textNode)
            } else {
                parentNode.appendChild(uniqueNode)
            }

            if (resultNode.nodeType !== Node.TEXT_NODE) {
                resultLinksNodes.push(uniqueNode)
            }
        })

        return resultLinksNodes
    }

    private unwrapPhone(node: Node) {
        const content = node.parentNode.textContent
        const parentNode = node.parentNode
        const textNode = document.createTextNode(content)
        parentNode.replaceChild(textNode, node)

        return {parentNode, textNode}
    }
}
