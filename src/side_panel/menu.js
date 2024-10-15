document.addEventListener('DOMContentLoaded', () =>
{
    document.getElementById('wa').addEventListener('click', () =>
    {
        chrome.storage.session.set({ URL: 'https://www.wolframalpha.com/' })
    })
    document.getElementById('symbolab').addEventListener('click', () =>
    {
        chrome.storage.session.set({ URL: 'https://www.symbolab.com/solver/' })
    })
    document.getElementById('desmos').addEventListener('click', () =>
    {
        chrome.storage.session.set({ URL: 'https://www.desmos.com/calculator' })
    })
    document.getElementById('desmos3D').addEventListener('click', () =>
    {
        chrome.storage.session.set({ URL: 'https://www.desmos.com/3d' })
    })
    document.getElementById('piazza').addEventListener('click', () =>
    {
        chrome.storage.session.set({ URL: 'https://piazza.com/class/' })
    })
})
