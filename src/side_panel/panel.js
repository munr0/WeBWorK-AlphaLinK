document.addEventListener("DOMContentLoaded", () =>
{
    console.log("panel.js loaded");

    (async () =>
    {
        // enable content embedding — https://github.com/HotariTobu/ignore-x-frame-options
        await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: [1],
            addRules: [{
                id: 1,
                priority: 1,
                action: {
                    type: "modifyHeaders",
                    responseHeaders: [{
                        header: "x-frame-options",
                        operation: "remove"
                    }]
                },
                condition: {
                    urlFilter: "https://www.wolframalpha.com/",
                    resourceTypes: ["main_frame", "sub_frame"]
                }
            }]
        })

        updateSrc()
    })()
})


chrome.storage.onChanged.addListener(function (changes, area)
{
    if (area === 'session')
        updateSrc(changes)
})

async function updateSrc()
{
    const data = await chrome.storage.session.get(['URL'])
    const page = data.URL
    document.querySelector('iframe').src = page
}
