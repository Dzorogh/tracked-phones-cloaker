// @ts-ignore
import style from "bundle-text:../style.css"

export function setupStyle() {
    const styleElement = document.createElement("style")
    styleElement.textContent = style as string
    document.head.appendChild(styleElement)
}

