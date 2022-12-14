/**
 * @see https://developer.chrome.com/extensions/browserAction#toc
 */


/// <reference path="../../common/chrome-api.d.ts"/>

export class BrowserActionApiImpl implements BrowserActionApi {
    title: string;
    badgeText: string;
    color: ColorArray;

    setTitle(data: { title: string; }): void {
        this.title = data.title;
    }

    setBadgeText(data: { text: string; }): void {
        this.badgeText = data.text
    }

    setBadgeBackgroundColor(details: { color: ColorArray }): void {
        this.color = details.color
    }
}