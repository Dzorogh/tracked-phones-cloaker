// ==UserScript==
// @name        calltouch-enhanced
// @namespace   Violentmonkey Scripts
// @match       https://globaldrive.ru/*
// @grant       none
// @version     1.0
// @author      -
// @description 25/08/2023, 16:03:34
// ==/UserScript==

console.log('Monkey Script Loaded');

const phoneWrapperTagName = 'tracked-phone';

class PhoneWrapper extends HTMLElement {
}

class PluginDetector {
  iterations = 0
  interval = undefined
  awaitForWindowObject = (param) => {
    return new Promise((resolve, reject) => {
      this.interval = setInterval(() => {
        if (window[param]) {
          clearInterval(this.interval);
          resolve(window[param])
        }

        if (this.iterations > 1000) {
          clearInterval(this.interval);
          reject()
        }
      }, 50);
    })
  }
}

class PhoneNumbersParser {
  ruPhone = /((\+7|[7,8])\ ?(\d{10}|(\(?\d{3}\)?\ ?\d{3}[\-,\ ]?\d{2}[\-,\ ]?\d{2})))/igm;
  // ruPhone = /(^8|7|\+7)((\d{10})|(\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}))/im;
  excludedTags = ['script', phoneWrapperTagName]

  #rootNode = undefined

  /**
   * @param {Node|Element} rootNode
   */
  constructor(rootNode) {
    if (rootNode) {
      this.#rootNode = rootNode
    } else {
      this.#rootNode = document.body
    }
  }

  /**
   * @param {string} string
   */
  #getPhoneMatches(string) {
    const matches = string.matchAll(this.ruPhone)
    return [...matches].map((match) => match[1])
  }

  // // find phones with regex from all html
  // findStrings() {
  //   return this.#getPhoneMatches(this.#rootNode.innerHTML)
  // }

  //  find all nodes that have phone in text
  //  If node (or ony parent node) is link — return it,
  //  else — wrap number inside node in link and return
  //  returns Iterator
  /**
   * @return Node[]
   */
  findTextNodesWithPhones() {

    // Find all text nodes
    const textNodesWalker = document
      .createTreeWalker(this.#rootNode, NodeFilter.SHOW_TEXT, (node) =>
        !this.excludedTags.includes(node.parentNode.nodeName.toLowerCase())
        && node.textContent.trim().length > 0
        && this.#getPhoneMatches(node.textContent.trim()).length > 0
      );

    const resultArray = [];

    // Make array of nodes, that contains phones in self content
    while (textNodesWalker.nextNode()) {
      resultArray.push(textNodesWalker.currentNode)
    }

    return resultArray;
  }

  #makeTelFromPhoneNumber(phone) {
    return phone.replace(/[\D|+]/g, "")
  }

  /**
   * Will replace ALL phones in text node,
   * even multiple times,
   * for multiple phone numbers,
   * with links and return new links nodes.
   *
   * @param {Node|Element} textNode
   * @param {string[]} phones
   */
  replacePhoneStringsWithLinks(textNode, phones) {
    const parentNode = textNode.parentNode;

    const resultNodes = [textNode];

    // for each phone split text nodes and make result array
    phones.forEach((phone) => {
      const linkElement = document.createElement('a');
      const tel = this.#makeTelFromPhoneNumber(phone);
      linkElement.setAttribute('href', "tel:" + tel);
      linkElement.textContent = phone;

      resultNodes.forEach((resultNode, resultNodeIndex) => {
        if (resultNode.nodeType === Node.TEXT_NODE) {
          const newStrings = resultNode.textContent.split(phone);
          const newNodes = [];

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

    const resultLinksNodes = [];

    resultNodes.forEach((resultNode, resultNodeIndex) => {
      const uniqueNode = resultNode.cloneNode(true)

      if (resultNodeIndex === 0) {
        parentNode.replaceChild(uniqueNode, textNode);
      } else {
        parentNode.appendChild(uniqueNode);
      }

      if (resultNode.nodeType !== Node.TEXT_NODE) {
        resultLinksNodes.push(uniqueNode);
      }
    })

    return resultLinksNodes;
  }

  /**
   * @param {Node[]} textNodes
   * @return {{
   *   link: Node,
   *   wrapper: Node
   * }[]}
   */
  wrapPhones(textNodes) {
    const result = []

    for (const textNode of textNodes) {
      const parentNode = textNode.parentNode;
      const phones = this.#getPhoneMatches(textNode.textContent.trim());

      // Не рассматриваем ситуацию,
      // где в одной ссылке может быть несколько номеров телефонов
      if (parentNode.nodeName.toLowerCase() === 'a') {
        // Если телефон найден в ссылке

        const wrapperNode = document.createElement(phoneWrapperTagName);
        wrapperNode.textContent = textNode.textContent;
        parentNode.replaceChild(wrapperNode, textNode);

        result.push({
          link: parentNode,
          wrapper: wrapperNode
        });
      } else if (parentNode.closest('a') && parentNode.closest('a').getAttribute('href').startsWith('tel:')) {
        // Если выше по дереву есть ссылка, проверяем — телефонная ли она.

        const wrapperNode = document.createElement(phoneWrapperTagName);
        wrapperNode.textContent = textNode.textContent;
        parentNode.replaceChild(wrapperNode, textNode);

        result.push({
          link: parentNode.closest('a'),
          wrapper: wrapperNode
        });
      } else {
        // Если это просто номер в тексте

        const newLinkNodes = this.replacePhoneStringsWithLinks(textNode, phones);

        result.push(...newLinkNodes.map((linkNode) => {
          const wrapperNode = document.createElement(phoneWrapperTagName);
          wrapperNode.textContent = linkNode.textContent;
          linkNode.textContent = null;
          linkNode.appendChild(wrapperNode);

          return {
            link: linkNode,
            wrapper: wrapperNode
          }
        }));
      }
    }

    return result;
  }

  parseAllPhonesAsNodes() {
    const nodesWithPhone = this.findTextNodesWithPhones();

    return this.wrapPhones(nodesWithPhone);
  }
}

class PhoneNumbersFormatter {
  phone = undefined

  constructor(phone) {
    this.phone = phone
  }

  isFormatted() {
    return !!this.phone.match(/^(.*(\ |\(|\)|-).*)$/)
  }

  getDigits() {
    return this.phone.replace(/\D/g, "")
  }

  formatLinkTel(element) {
    element.setAttribute('href', 'tel:' + this.getDigits())
  }

  formatText(element) {
    element.textContent = this.getFormattedPhone()
  }

  getFormattedPhone() {
    const phoneDigits = this.getDigits().slice(-10)
    let startsWith = '';

    if (phoneDigits.startsWith('800')) {
      startsWith = '8'
    } else {
      startsWith = '+7'
    }

    return phoneDigits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})$/g, `${startsWith} $1 $2-$3-$4`);
  }
}

class PhoneNumbersCloaker {
  linkNode = undefined
  fullPhoneText = ''

  /**
   * @param {Element} phoneElement
   */
  constructor(phoneElement) {
    this.linkNode = phoneElement
    this.fullPhoneText = phoneElement.textContent
  }

  cloak() {
    const value = 'linear-gradient(90deg, white 0%, white 30%, rgba(0,0,0,.1) 80%, rgba(0,0,0,.01) 90%)';
    this.linkNode.style.webkitMaskImage = value;
    this.linkNode.style.maskImage = value;
  }

  uncloak() {
    this.linkNode.style.webkitMaskImage = 'none';
    this.linkNode.style.maskImage = 'none';
  }
}

class Service {
  processPhonesInNode(node) {
    const t0 = performance.now();

    const parser = new PhoneNumbersParser(node);
    const phones = parser.parseAllPhonesAsNodes()

    const t1 = performance.now();
    console.log(`Parsing phones take ${Math.round(t1 - t0)} milliseconds.`);

    phones.forEach((item) => {
      const cloaker = new PhoneNumbersCloaker(item.wrapper);
      cloaker.cloak();

      // Format phones
      const formatter = new PhoneNumbersFormatter(item.wrapper.textContent)
      formatter.formatLinkTel(item.link)
      formatter.formatText(item.wrapper)

      const handleHover = () => {
        console.log('hover');

        cloaker.uncloak()

        item.wrapper.removeEventListener('mouseenter', handleHover)
        item.wrapper.removeEventListener('click', handleClick)
      }

      const handleClick = (e) => {
        console.log('click');

        e.preventDefault();
        cloaker.uncloak()

        item.wrapper.removeEventListener('mouseenter', handleHover)
        item.wrapper.removeEventListener('click', handleClick)

        // setTimeout(() => {
        //   e.target.click()
        // }, 100)
      }

      item.wrapper.addEventListener('mouseenter', handleHover)
      item.wrapper.addEventListener('click', handleClick)

      // todo: wait for ct object appear
      // todo: replace phone with call tracking before hider.show() triggered
      // todo: show animation when phone is loading
      // todo: replace phone number on click: prevent click, wait for response, set phone
    });

    const t2 = performance.now();
    console.log(`Formatting phones take ${Math.round(t2 - t1)} milliseconds.`);
  }
}

(function () {
  customElements.define(phoneWrapperTagName, PhoneWrapper);
  const rootNode = document.body;
  const service = new Service();

  service.processPhonesInNode(rootNode)

  setInterval(() => service.processPhonesInNode(rootNode), 1000);

  const detector = new PluginDetector();
  detector.awaitForWindowObject('ct').then((ct) => {
    console.log('ct', ct)
  })

  // TODO: Observe DOM, replace phones in each changed node
  // observer.observe(document.body, {childList: true, subtree: true});

})();
