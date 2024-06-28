/* Execute things on behalf of content scripts */
chrome.runtime.onMessage.addListener(function (message, sender)
{
    (async () =>
    {
        if (message.type === 'open_side_panel') {
            chrome.storage.session.set({ URL: message.data }) // make URL available to panel.js
            await chrome.sidePanel.open({ tabId: sender.tab.id })
            await chrome.sidePanel.setOptions({
                tabId: sender.tab.id,
                path: 'side_panel/panel.html',
                enabled: true,
            })
        }
    })()
})
