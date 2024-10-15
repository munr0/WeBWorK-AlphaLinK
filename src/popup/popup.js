let defaultSettings = {
    zoom: 1.0,
    newTab: false,
    table: true,
    paren: true
}


// side panel opens with spacebar inside popup
document.addEventListener('keydown', (e) =>
{
    if (e.key === ' ') {
        chrome.runtime.sendMessage({ type: 'global_side_panel' })
        window.close()
    }
})


document.addEventListener('DOMContentLoaded', async () =>
{
    console.log('popup.js loaded')

    // inject courses into popup.html
    {
        const data = await chrome.storage.sync.get(['courses'])
        const courses = data.courses || []
        console.log(courses)
        courses.forEach((course) =>
        {
            const [pathname, nickname] = course.split('||')
            const inject = `
            <tr id="${pathname}" class="course">
                <td>${nickname}</td>
                <td>
                    <img src="assets/open.svg" alt="&nearr;">
                </td>
            </tr>`
            document.getElementById('courselist').insertAdjacentHTML('beforeend', inject)
        })
    }

    // get and display user settings
    {
        let savedSettings
        try {
            const data = await chrome.storage.sync.get(['settings'])
            savedSettings = data.settings || defaultSettings
        }
        catch {
            savedSettings = defaultSettings
        }
        console.log(savedSettings)
        renderSettings(savedSettings)
    }

    // handle interactions
    document.addEventListener('click', (e) =>
    {
        const el = e.target.id

        switch (el) {
            case 'openPanel':
                chrome.runtime.sendMessage({ type: 'global_side_panel' })
                window.close()
                break
            case 'viewShortcuts':
                document.getElementById('main_pg').classList.add('hidden')
                document.getElementById('shortcuts_pg').classList.remove('hidden')
                break
            case 'back':
                document.getElementById('main_pg').classList.remove('hidden')
                document.getElementById('shortcuts_pg').classList.add('hidden')
                break
            case 'setDefaults':
                renderSettings(defaultSettings)
                storeSettings()
                break
            case 'zoomOut':
                adjZoomLvl(-0.1)
                storeSettings()
                break
            case 'zoomIn':
                adjZoomLvl(0.1)
                storeSettings()
                break
            default:
                if (e.target.closest('.course')) { // 'My Classes' links
                    const pathname = e.target.closest('.course').id
                    const page = 'https://webwork.elearning.ubc.ca/webwork2/' + pathname
                    chrome.tabs.create({ url: page })
                }
                else {
                    storeSettings() // update in case click was on a checkbox
                }
                break
        }
    })

    // context menu for renaming and deleting courses
    /* FUTURE IMPLEMENTATION */
})


function renderSettings(settings)
{
    document.getElementById('zoomLvl').textContent = settings.zoom.toFixed(1)
    document.getElementById('newTab').checked = settings.newTab
    document.getElementById('table').checked = settings.table
    document.getElementById('paren').checked = settings.paren
}

function storeSettings()
{
    const settings = {
        zoom: parseFloat(document.getElementById('zoomLvl').textContent),
        newTab: document.getElementById('newTab').checked,
        table: document.getElementById('table').checked,
        paren: document.getElementById('paren').checked
    }
    chrome.storage.sync.set({ settings: settings })
}

function adjZoomLvl(amount)
{
    const el = document.getElementById('zoomLvl')
    let zoom = parseFloat(el.textContent)
    zoom += amount
    zoom = (zoom < 0.5) ? 0.5 : zoom
    zoom = (zoom > 2.0) ? 2.0 : zoom
    el.textContent = zoom.toFixed(1)
}
