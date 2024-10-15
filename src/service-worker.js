/* This is just a proxy for opening the side panel */
chrome.runtime.onMessage.addListener(async (message, sender) =>
{
    if (message.type === 'open_side_panel') {
        console.log('open_side_panel')
        close() // ensures a refresh if same URL is sent
        open(message.data, sender.tab.id)
    }
    else if (message.type === 'global_side_panel') {
        console.log('global_side_panel')
        chrome.windows.getCurrent((window) =>
        {
            open(message.data, null, window.id)
        })
    }
    else if (message.type === 'toggle_side_panel') {
        console.log('toggle_side_panel')
        chrome.runtime.getContexts(
            { contextTypes: ['SIDE_PANEL'] },
            function (activePanels) // callback
            {
                if (!activePanels[0])
                    open('menu.html', sender.tab.id)
                else
                    close()
            })
    }
})


async function open(URL, tabId, windowId)
{
    chrome.storage.session.set({ URL: URL }) // make URL available to panel.js
    if (tabId) {
        await chrome.sidePanel.open({ tabId: tabId }) // issue – see https://github.com/GoogleChrome/chrome-extensions-samples/issues/1179
        await chrome.sidePanel.setOptions({
            tabId: tabId,
            path: 'side_panel/panel.html',
            enabled: true,
        })
    }
    else {
        await chrome.sidePanel.open({ windowId: windowId })
    }
}

function close()
{
    chrome.storage.session.set({ URL: 'close' }) // triggers window.close in panel.js
}
