## Description

Finds and cloaks any phone numbers on the page. Upon hover and click, it utilizes call tracking services to obtain dynamic phone numbers and replace them. It also formats and creates tel: links for every phone number within the text.

<img width="287" alt="image" src="https://github.com/Dzorogh/tracked-phones-cloaker/assets/1428839/a7fa08b6-9b6f-4763-90f2-c9c07ed48fbf">

## Demo

https://tracked-phones-cloaker.gddev.ru/ 

## How to use

Create tag in Google Tag Manager with custom HTML code:

```html
<script src="https://unpkg.com/tracked-phones-cloaker@1.0.26/dist/global/tracked-phones-cloaker.js"></script>
<script>
  new TrackedPhonesCloaker({
    // For Avant
    metrikaCounterId: string,
    calltracking: 'avantelecom'

    // Or for Calltouch
    calltouchId: string,
    calltracking: 'calltouch'
  })
</script>
```
