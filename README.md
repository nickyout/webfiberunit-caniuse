# webfiberunit-caniuse

## Introduction
There are so many caveats when it comes to cross-browser testing in selenium. When it comes to opening a page and making a snapshot, it works fine. But when you start testing web-based applications, you soon notice that every browser driver is significantly different. 

Did you know:

 * The Chrome driver supports multi file input?
 * The IE driver supports multi file input, but differently?
 * Firefox (afaik) does not support multi file input?
 * Safari does not support file input at all?
 * The IE driver forbids interaction with inputs that have opacity=0?
 * Firefox and Chrome do not forbid it interaction with inputs that have opacity=0?
 * HTML 'a' elements can be selected by their text content using the 'link text' protocol?
 * HTML 'span', 'p', 'div' elements cannot be selected by their text contents using the 'link text' protocol?
 * CSS properties you request will be 'like' the actual values, not equal to the actual values?

Considering the time you find this out is probably while running a test on a browser farm like Browserstack or Saucelabs, you will generally find the quirks of a command in a certain driver after the test was already written. 

But that is not all. Start looking for nodejs libraries that implement the [JsonWire protocol][1] and even amongst the most popular ones you find the trend of terse and/or incomplete documentation. Ultimately, you end up searching for commands in the nodejs terminal, looking up the command in the source code, finding the JsonWire path and looking up the command in the JsonWire documentation. Of which its status is, by the way, on DRAFT.

So I picked [WebdriverIO][2] as my preferred nodejs selenium handling library, as it handles all browser farms and has a relatively concise, well-written API, that is not dynamically generated like [wd][3]. And just like most similar libraries, its API is mostly asynchronous. As I found it tedious to catch every possible error by appending every command with yet another callback, I decided to create [webfiberunit][4], which is essentially WebdriverIO, written synchronously, in nodeunit. 

## Intent

Now I want to know what selenium functionality is cross-browser, cross-driver, available to me. I want a page where I can lookup the support and quirks across drivers of every usage of every command I want to use. 

So my goal is to cover every WebdriverIO (2.x) command available and check if and how it works. To make the test easy to write, I use my own library, webfiberunit. Considering my deal is mostly desktop browser web-applications, the desktop browser supported commands will be my main focus. 

## TODO

### Desktop

*   ~~inst.addValue~~
*   ~~inst.alertAccept~~
*   ~~inst.alertDismiss~~
*   ~~inst.alertText~~
*   inst.applicationCacheStatus
*   inst.back
*   inst.buttonDown
*   inst.buttonPress
*   inst.buttonUp
*   ~~inst.chooseFile~~
*   ~~inst.clearElement~~
*   ~~inst.click~~
*   inst.close
*   inst.context
*   inst.cookie
*   ~~inst.deleteCookie~~
*   inst.deviceKeyEvent
*   inst.doDoubleClick
*   inst.doubleClick
*   inst.dragAndDrop (HTML5)
*   ~~inst.element~~
*   ~~inst.elementActive~~
*   ~~inst.elementIdAttribute~~
*   ~~inst.elementIdClear~~
*   ~~inst.elementIdClick~~
*   ~~inst.elementIdCssProperty~~
*   ~~inst.elementIdDisplayed~~
*   ~~inst.elementIdEnabled~~
*   ~~inst.elementIdLocation~~
*   ~~inst.elementIdLocationInView~~
*   ~~inst.elementIdName~~
*   ~~inst.elementIdSelected~~
*   ~~inst.elementIdSize~~
*   ~~inst.elementIdText~~
*   inst.elementIdValue
    *   input text
    *   input number
    *   textarea
*   ~~inst.elements~~
*   ~~inst.execute~~
*   inst.executeAsync
*   inst.file
*   inst.flick
*   inst.flickDown
*   inst.flickLeft
*   inst.flickRight
*   inst.flickUp
*   inst.forward
*   inst.frame
*   inst.frameParent
*   ~~inst.getAttribute~~
*   ~~inst.getCookie~~
*   ~~inst.getCssProperty~~
*   inst.getCurrentDeviceActivity
*   ~~inst.getCurrentTabId~~
*   inst.getElementSize
*   inst.getGeoLocation
*   inst.getHTML
*   inst.getLocation
*   inst.getLocationInView
*   inst.getSource
*   ~~inst.getTabIds~~
*   ~~inst.getTagName~~
*   ~~inst.getText~~
*   ~~inst.getTitle~~
*   ~~inst.getValue~~
*   inst.hold
*   ~~inst.imeActivate~~
*   ~~inst.imeActivated~~
*   ~~inst.imeActiveEngine~~
*   ~~inst.imeAvailableEngines~~
*   ~~inst.imeDeactivated~~
*   ~~inst.implicitWait~~
*   ~~inst.isEnabled~~
*   ~~inst.isExisting~~
*   ~~inst.isSelected~~
*   ~~inst.isVisible~~
*   inst.keys
    *   ~~characters~~
    *   non-character keys ([JSONWire doc][5])
*   inst.leftClick
*   inst.localStorage
*   inst.localStorageSize
*   inst.location
*   inst.lock
*   inst.log
*   inst.logTypes
*   inst.middleClick
*   inst.moveTo
*   inst.moveToObject
*   inst.newWindow
*   inst.openNotifications
*   ~~inst.pause~~
*   inst.performMultiAction
*   inst.performTouchAction
*   inst.pullFileFromDevice
*   inst.pushFileToDevice
*   inst.refresh
*   inst.release
*   inst.rightClick
*   inst.rotate
*   ~~inst.saveScreenshot~~
*   ~~inst.screenshot~~
*   inst.scroll
    *   ~~window~~
    *   div
*   inst.session
*   inst.sessionStorage
*   inst.sessionStorageSize
*   inst.sessions
*   ~~inst.setCookie~~
*   inst.setValue
    *   input text
    *   input number
    *   textarea
*   inst.source
*   inst.status
*   inst.submit
*   inst.submitForm
*   ~~inst.switchTab~~
*   inst.timeouts
*   inst.timeoutsAsyncScript
*   inst.timeoutsImplicitWait
*   ~~inst.title~~
*   inst.touch
*   inst.touchClick
*   inst.touchDoubleClick
*   inst.touchDown
*   inst.touchFlick
*   inst.touchLongClick
*   inst.touchMove
*   inst.touchScroll
*   inst.touchUp
*   inst.uploadFile
*   ~~inst.url~~
*   ~~inst.waitFor~~
*   ~~inst.waitForChecked~~
*   ~~inst.waitForEnabled~~
*   ~~inst.waitForExist~~
*   ~~inst.waitForSelected~~
*   ~~inst.waitForText~~
*   ~~inst.waitForValue~~
*   ~~inst.waitForVisible~~
*   ~~inst.window~~
*   ~~inst.windowHandle~~
*   ~~inst.windowHandleMaximize~~
*   ~~inst.windowHandlePosition~~
*   ~~inst.windowHandleSize~~
*   ~~inst.windowHandles~~

### Mobile
Not interested. Unlikely to happen.

*   inst.toggleAirplaneModeOnDevice
*   inst.toggleDataOnDevice
*   inst.toggleLocationServicesOnDevice
*   inst.toggleWiFiOnDevice
*   inst.shake
*   inst.setOrientation
*   inst.setGeoLocation
*   inst.setImmediateValueInApp
*   inst.setNetworkConnection
*   inst.removeAppFromDevice
*   inst.resetApp
*   inst.orientation
*   inst.getNetworkConnection
*   inst.getOrientation
*   inst.backgroundApp
*   inst.getAppStrings
*   inst.launchApp
*   inst.installAppOnDevice
*   inst.isAppInstalledOnDevice
*   inst.closeApp
*   inst.hideDeviceKeyboard

[1]: https://code.google.com/p/selenium/wiki/JsonWireProtocol "JsonWireProtocol"
[2]: https://github.com/webdriverio/webdriverio "WebdriverIO on Github"
[3]: https://github.com/admc/wd "wd on Github"
[4]: https://github.com/nickyout/webfiberunit "webfiberunit on Github"
[5]: https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/element/:id/value "JSONWire sendkeys doc"
