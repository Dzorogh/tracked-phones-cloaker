function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
// ==UserScript==
// @name        calltouch-enhanced
// @namespace   Violentmonkey Scripts
// @match       https://globaldrive.ru/*
// @grant       none
// @version     1.0
// @author      -
// @description 25/08/2023, 16:03:34
// ==/UserScript==
const $8d78f77e9e38adc1$export$c4db86264c92e870 = "tracked-phone";
class $8d78f77e9e38adc1$export$6a3d66fba6157564 extends HTMLElement {
}
function $8d78f77e9e38adc1$export$feb348eaf4031ce3() {
    customElements.define($8d78f77e9e38adc1$export$c4db86264c92e870, $8d78f77e9e38adc1$export$6a3d66fba6157564);
}



class $5aef461f0da37c8e$export$1115924fc36cb4f2 {
    constructor(phone){
        this.phone = undefined;
        this.phone = phone;
    }
    isFormatted() {
        return !!this.phone.match(/^(.*([ ()-]).*)$/);
    }
    getDigits() {
        return this.phone.replace(/\D/g, "");
    }
    // formatLinkTel(element: HTMLElement) {
    //     element.setAttribute('href', 'tel:' + this.getDigits())
    // }
    //
    // formatText(element: HTMLElement) {
    //     element.textContent = this.getFormattedPhone()
    // }
    getFormattedPhone() {
        const phoneDigits = this.getDigits().slice(-10);
        let startsWith = "";
        if (phoneDigits.startsWith("800")) startsWith = "8";
        else startsWith = "+7";
        return phoneDigits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})$/g, `${startsWith} $1 $2-$3-$4`);
    }
}


class $80021da09f7d1d1f$export$f8969add109fffe8 {
    constructor(wrapperNode, linkNode){
        this.onInteractionCallbacks = [];
        this.isCloaked = false;
        this.cloakedAttrName = "cloaked";
        this.isLoading = false;
        this.loadingAttrName = "loading";
        this.isClickDelayed = false;
        this.handleHover = async ()=>{
            this.removeHoverListener();
            this.loadingStart();
            await this.onInteractionTrigger();
            this.loadingFinish();
        };
        this.handleClick = async (e)=>{
            this.startDelayedClick(e);
            if (!this.isLoading) {
                this.loadingStart();
                await this.onInteractionTrigger();
                this.loadingFinish();
            }
        };
        this.wrapperNode = wrapperNode;
        this.linkNode = linkNode;
        this.initialDigits = this.getDigits();
    }
    init() {
        this.cloak();
        this.formatTel();
        this.formatText();
        this.addListeners();
    }
    getWrapperNode() {
        return this.wrapperNode;
    }
    getLinkNode() {
        return this.linkNode;
    }
    revealPhone(phone) {
        this.setPhone(phone);
        this.formatTel();
        this.formatText();
        this.loadingFinish();
        this.uncloak();
        this.removeHoverListener();
        this.removeClickListener();
        this.finishDelayedClick();
    }
    getDigits() {
        const formatter = new (0, $5aef461f0da37c8e$export$1115924fc36cb4f2)(this.getText());
        return formatter.getDigits();
    }
    getInitialDigits() {
        return this.initialDigits;
    }
    onInteraction(cb) {
        this.onInteractionCallbacks.push(cb);
    }
    getText() {
        return this.getWrapperNode().textContent;
    }
    setTel(value) {
        this.getLinkNode().setAttribute("href", "tel:" + value);
    }
    setText(newValue) {
        this.getWrapperNode().textContent = newValue;
        return newValue;
    }
    getHref() {
        return this.getLinkNode().getAttribute("href");
    }
    formatTel() {
        const formatter = new (0, $5aef461f0da37c8e$export$1115924fc36cb4f2)(this.getText());
        this.setTel(formatter.getDigits());
    }
    formatText() {
        const formatter = new (0, $5aef461f0da37c8e$export$1115924fc36cb4f2)(this.getText());
        this.setText(formatter.getFormattedPhone());
    }
    loadingStart() {
        this.isLoading = true;
        this.getWrapperNode().setAttribute(this.loadingAttrName, "");
    }
    loadingFinish() {
        this.isLoading = true;
        this.getWrapperNode().removeAttribute(this.loadingAttrName);
    }
    setPhone(phone) {
        const formatter = new (0, $5aef461f0da37c8e$export$1115924fc36cb4f2)(phone);
        this.setText(formatter.getFormattedPhone());
        this.setTel(formatter.getDigits());
    }
    async onInteractionTrigger() {
        for await (const cb of this.onInteractionCallbacks)await cb();
    }
    removeClickListener() {
        this.getWrapperNode().removeEventListener("click", this.handleClick);
    }
    removeHoverListener() {
        this.getWrapperNode().removeEventListener("mouseenter", this.handleHover);
    }
    uncloak() {
        this.isCloaked = false;
        this.getWrapperNode().removeAttribute(this.cloakedAttrName);
    }
    cloak() {
        this.isCloaked = true;
        this.getWrapperNode().setAttribute(this.cloakedAttrName, "");
    }
    addListeners() {
        this.getWrapperNode().addEventListener("mouseenter", this.handleHover);
        this.getWrapperNode().addEventListener("click", this.handleClick);
    }
    startDelayedClick(e) {
        if (this.isCloaked) {
            e.preventDefault();
            this.isClickDelayed = true;
        }
    }
    finishDelayedClick() {
        if (this.isClickDelayed) {
            location.href = this.getHref();
            this.isClickDelayed = false;
        }
    }
}


class $65f42f8d1b5c22f1$export$7f7034923e902a9c {
    constructor(rootNode, phonesMap, wrappersSet){
        this.ruPhone = /((\+7|[,78]) ?(\d{10}|(\(?\d{3}\)? ?\d{3}(?:[ ,\-]?\d{2}){2})))/gim;
        // ruPhone = /(^8|7|\+7)((\d{10})|(\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}))/im;
        this.excludedTags = [
            "script"
        ];
        this.phonesMap = phonesMap;
        this.wrappersSet = wrappersSet;
        if (rootNode) this.rootNode = rootNode;
        else this.rootNode = document.body;
    }
    parseAllPhonesAsNodes() {
        const nodesWithPhone = this.findTextNodesWithPhones();
        const wrappedPhones = this.wrapPhones(nodesWithPhone);
        wrappedPhones.forEach((item)=>{
            this.addPhoneItemToMapAndSet(item);
        });
        return wrappedPhones;
    }
    addPhoneItemToMapAndSet(phoneItem) {
        const phone = phoneItem.getInitialDigits();
        // wrappers
        this.wrappersSet.add(phoneItem.getWrapperNode());
        // nodes by phone number
        if (this.phonesMap.has(phone)) {
            const existingSet = this.phonesMap.get(phone);
            existingSet.add(phoneItem);
            this.phonesMap.set(phone, existingSet);
        } else this.phonesMap.set(phone, new Set([
            phoneItem
        ]));
    }
    wrapPhones(textNodes) {
        const result = [];
        for (let textNode of textNodes){
            let parentNode = textNode.parentNode;
            const phones = this.getPhoneMatches(textNode.textContent.trim());
            if (parentNode.nodeName.toLowerCase() === (0, $8d78f77e9e38adc1$export$c4db86264c92e870).toLowerCase()) {
                // already wrapped
                if (this.wrappersSet.has(parentNode)) continue;
                else {
                    console.log("Found broken Phone Wrapper!", parentNode);
                    const result = this.unwrapPhone(parentNode);
                    textNode = result.textNode;
                    parentNode = result.parentNode;
                }
            }
            // Не рассматриваем ситуацию,
            // где в одной ссылке может быть несколько номеров телефонов
            if (parentNode.nodeName.toLowerCase() === "a") {
                // Если телефон найден в ссылке
                const wrapperNode = document.createElement((0, $8d78f77e9e38adc1$export$c4db86264c92e870));
                wrapperNode.textContent = textNode.textContent;
                parentNode.replaceChild(wrapperNode, textNode);
                result.push(new (0, $80021da09f7d1d1f$export$f8969add109fffe8)(wrapperNode, parentNode));
            } else if (parentNode.closest("a") && parentNode.closest("a").getAttribute("href").startsWith("tel:")) {
                // Если выше по дереву есть ссылка, проверяем — телефонная ли она.
                const wrapperNode = document.createElement((0, $8d78f77e9e38adc1$export$c4db86264c92e870));
                wrapperNode.textContent = textNode.textContent;
                parentNode.replaceChild(wrapperNode, textNode);
                result.push(new (0, $80021da09f7d1d1f$export$f8969add109fffe8)(wrapperNode, parentNode.closest("a")));
            } else {
                // Если это просто номер в тексте
                const newLinkNodes = this.replacePhoneStringsWithLinks(textNode, phones);
                result.push(...newLinkNodes.map((linkNode)=>{
                    const wrapperNode = document.createElement((0, $8d78f77e9e38adc1$export$c4db86264c92e870));
                    wrapperNode.textContent = linkNode.textContent;
                    linkNode.textContent = null;
                    linkNode.appendChild(wrapperNode);
                    return new (0, $80021da09f7d1d1f$export$f8969add109fffe8)(wrapperNode, linkNode);
                }));
            }
        }
        return result;
    }
    getPhoneMatches(text) {
        const matches = text.matchAll(this.ruPhone);
        return [
            ...matches
        ].map((match)=>match[1]);
    }
    // findStrings() {
    //     return this.getPhoneMatches(this.rootNode.innerHTML)
    // }
    //  find all nodes that have phone in text
    //  If node (or ony parent node) is link — return it,
    //  else — wrap number inside node in link and return
    //  returns Iterator
    findTextNodesWithPhones() {
        // Find all text nodes
        const textNodesWalker = document.createTreeWalker(this.rootNode, NodeFilter.SHOW_TEXT, (node)=>!this.excludedTags.includes(node.parentNode.nodeName.toLowerCase()) && node.textContent.trim().length > 0 && this.getPhoneMatches(node.textContent.trim()).length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT);
        const resultArray = [];
        // Make array of nodes, that contains phones in self content
        while(textNodesWalker.nextNode())resultArray.push(textNodesWalker.currentNode);
        return resultArray;
    }
    makeTelFromPhoneNumber(phone) {
        return phone.replace(/\D/g, "");
    }
    /**
     * Will replace ALL phones in text node,
     * even multiple times,
     * for multiple phone numbers,
     * with links and return new links nodes.
     */ replacePhoneStringsWithLinks(textNode, phones) {
        const parentNode = textNode.parentNode;
        const resultNodes = [
            textNode
        ];
        // for each phone split text nodes and make result array
        phones.forEach((phone)=>{
            const linkElement = document.createElement("a");
            const tel = this.makeTelFromPhoneNumber(phone);
            linkElement.setAttribute("href", "tel:" + tel);
            linkElement.textContent = phone;
            resultNodes.forEach((resultNode, resultNodeIndex)=>{
                if (resultNode.nodeType === Node.TEXT_NODE) {
                    const newStrings = resultNode.textContent.split(phone);
                    const newNodes = [];
                    newStrings.forEach((newString, index)=>{
                        if (newString) newNodes.push(document.createTextNode(newString));
                        if (index < newStrings.length - 1) // if it is not last item — add link element.
                        newNodes.push(linkElement);
                    });
                    // replace splitted text string with new nodes
                    resultNodes.splice(resultNodeIndex, 1, ...newNodes);
                }
            });
        });
        const resultLinksNodes = [];
        resultNodes.forEach((resultNode, resultNodeIndex)=>{
            const uniqueNode = resultNode.cloneNode(true);
            if (resultNodeIndex === 0) parentNode.replaceChild(uniqueNode, textNode);
            else parentNode.appendChild(uniqueNode);
            if (resultNode.nodeType !== Node.TEXT_NODE) resultLinksNodes.push(uniqueNode);
        });
        return resultLinksNodes;
    }
    unwrapPhone(node) {
        const content = node.parentNode.textContent;
        const parentNode = node.parentNode;
        const textNode = document.createTextNode(content);
        parentNode.replaceChild(textNode, node);
        return {
            parentNode: parentNode,
            textNode: textNode
        };
    }
}


class $7fb63fd7457b8c3d$export$93b26a0b8215996b {
    constructor(){
        this.iterations = 0;
        this.interval = undefined;
        this.awaitForWindowObject = (param)=>{
            return new Promise((resolve, reject)=>{
                this.interval = setInterval(()=>{
                    if (window[param]) {
                        clearInterval(this.interval);
                        resolve(window[param]);
                    }
                    if (this.iterations > 1000) {
                        clearInterval(this.interval);
                        reject();
                    }
                }, 50);
            });
        };
    }
}


class $17398cbcfede397b$export$526382f42139a64a {
    async whenLoaded() {
        const detector = new (0, $7fb63fd7457b8c3d$export$93b26a0b8215996b)();
        this.ct = await detector.awaitForWindowObject("ct");
        return this;
    }
    dynamicReplacement(subPoolNamesContains) {
        return new Promise((resolve)=>{
            this.ct("dq3stqwe", "dynamic_replacement", {
                callback: (success, data)=>{
                    resolve(data);
                },
                subPoolNamesContains: subPoolNamesContains
            });
        });
    }
}


class $bc38cf49747a5a8a$export$8b2af884909d32a5 {
    constructor(phonesMap, wrappersSet){
        this.calltouchService = new (0, $17398cbcfede397b$export$526382f42139a64a)();
        this.phonesMap = phonesMap;
        this.wrappersSet = wrappersSet;
        this.calltouchService = new (0, $17398cbcfede397b$export$526382f42139a64a)();
    }
    processAllPhones() {
        const t0 = performance.now();
        const parser = new (0, $65f42f8d1b5c22f1$export$7f7034923e902a9c)(document.body, this.phonesMap, this.wrappersSet);
        const phones = parser.parseAllPhonesAsNodes();
        phones.forEach((phone)=>{
            phone.init();
            phone.onInteraction(async ()=>{
                await this.replacePhone(phone);
            });
        });
        const t1 = performance.now();
        console.log(`Parsing phones take ${Math.round(t1 - t0)} milliseconds.`);
        const t2 = performance.now();
        console.log(`Formatting phones take ${Math.round(t2 - t1)} milliseconds.`);
        return phones;
    }
    async replacePhone(phoneItem) {
        console.log("Replacing");
        await this.calltouchService.whenLoaded().then(async (service)=>{
            const data = await service.dynamicReplacement([
                phoneItem.getDigits()
            ]);
            // this.calltouchService.whenLoaded().then(async (service) => {
            //     console.log(service.calltrackingParams())
            // })
            const siblings = this.phonesMap.get(phoneItem.getInitialDigits());
            const trackedPhone = data && data[0] ? data[0].phoneNumber : phoneItem.getDigits();
            if (siblings) for (const sibling of siblings)sibling.revealPhone(trackedPhone);
        });
    }
}


// @ts-ignore
var $51c439a9a018474d$exports = {};
$51c439a9a018474d$exports = "tracked-phone {\n  position: relative;\n}\n\ntracked-phone[cloaked] {\n  -webkit-mask-image: linear-gradient(90deg, #fff 0% 20%, #0000001a 80%, #00000005 90%);\n  mask-image: linear-gradient(90deg, #fff 0% 20%, #0000001a 80%, #00000005 90%);\n}\n\ntracked-phone[loading]:after {\n  content: \"\";\n  background: linear-gradient(110deg, #fffc 5%, #fff0 20%, #fffc 80%) 0 0 / 200% 100%;\n  animation: .7s linear infinite shine;\n  position: absolute;\n  inset: 0;\n}\n\n@keyframes shine {\n  to {\n    background-position-x: -200%;\n  }\n}\n\n";


function $fbd706b8903f9b09$export$e5c45ca1e113bfed() {
    const styleElement = document.createElement("style");
    styleElement.textContent = (0, (/*@__PURE__*/$parcel$interopDefault($51c439a9a018474d$exports)));
    document.head.appendChild(styleElement);
}


// import {setupStyle} from "./setupStyle";
console.log("Monkey Script Loaded");
(async function() {
    (0, $8d78f77e9e38adc1$export$feb348eaf4031ce3)();
    (0, $fbd706b8903f9b09$export$e5c45ca1e113bfed)();
    const phonesMap = new Map();
    const wrappersSet = new Set();
    const service = new (0, $bc38cf49747a5a8a$export$8b2af884909d32a5)(phonesMap, wrappersSet);
    service.processAllPhones();
    setInterval(()=>service.processAllPhones(), 1000);
    console.log(phonesMap, wrappersSet);
// TODO: Observe DOM, replace phones in each changed node
// observer.observe(document.body, {childList: true, subtree: true});
})();


//# sourceMappingURL=calltouch-enhanced.user.js.map
