document.addEventListener('DOMContentLoaded', () =>
{
    console.log('panel.js loaded');

    (async () =>
    {
        // enable content embedding — https://github.com/HotariTobu/ignore-x-frame-options
        await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: [1],
            addRules: [{
                id: 1,
                priority: 1,
                action: {
                    type: 'modifyHeaders',
                    responseHeaders: [{
                        header: 'x-frame-options',
                        operation: 'remove'
                    }]
                },
                condition: {
                    regexFilter: 'https://(www.wolframalpha.com|www.symbolab.com)/',
                    resourceTypes: ['main_frame', 'sub_frame']
                }
            }]
        })

        updateSrc()
    })()
})

chrome.storage.onChanged.addListener((changes, area) =>
{
    if (area === 'session')
        updateSrc()
})

async function updateSrc()
{
    const data = await chrome.storage.session.get(['URL'])
    const page = data.URL || 'menu.html'
    if (page !== 'close')
        document.querySelector('iframe').src = page
    else
        window.close()
}
