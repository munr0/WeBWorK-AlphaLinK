/* Save course for popup.js */
(async () =>
{
    //await chrome.storage.sync.clear()
    const course = window.location.pathname.split('/webwork2/')[1].split('/')[0]
    let courses = []
    try {
        const data = await chrome.storage.sync.get(['courses'])
        courses = data.courses || []
    }
    finally {
        if (!courses.some(c => c.split('||')[0] === course)) {
            courses.push(course + '||' + course) // coursepathname||nickname, nickname can be changed in popup.js (IN FUTURE)
            courses.sort().reverse()
            chrome.storage.sync.set({ courses: courses })
        }
    }
})()


/* Initial UI customization */
window.addEventListener('load', async () =>
{
    const settings = await grabSettings()
    const enableTables = settings.table

    // check if WebWorK version is supported
    const supported = chrome.runtime.getManifest().version.split('.').slice(2, 4).join('.') // the patch version is the WW version that is supported
    const WWversion = document.getElementById('copyright')?.textContent?.match(/ww_version:\s*([\d.]+)/)[1]
    if (WWversion == supported)
        console.info('[WW—AL] Version match.')
    else
        console.warn(`[WW—AL] This build of WebWorK AlphaLink was developed for WebWorK version ${supported}. Performance may be unstable.`)

    // constants for later
    const textBox = document.querySelector('input[type="text"], input[type="checkbox"], input[type="radio"], select')
    const table = document.querySelector('table')

    // start cursor in the first textbox
    if (textBox) {
        textBox.focus()
        if (textBox?.tagName == 'INPUT' && textBox?.type == 'text')
            textBox.setSelectionRange(textBox.value.length, textBox.value.length)
    }

    // problems page
    else if (enableTables && table?.querySelector('caption')?.textContent.includes('Problems')) {
        const rows = table.querySelector('tbody').querySelectorAll('tr')

        rows.forEach(row =>
        {
            const cells = row.querySelectorAll('td')
            if (cells[4].textContent.includes('100%'))
                row.classList.add('CORRECT')
            else if (cells[2].textContent == 0)
                row.classList.add('INCORRECT')
            else if (cells[1].textContent != 0)
                row.classList.add('INPROGRESS')
        })
    }

    // courses page
    else if (enableTables && table?.querySelector('caption')?.textContent.includes('Homework Sets')) {
        (async (table) =>
        {
            let gradeRows
            try {
                // get page link
                let page
                const anchors = document.querySelectorAll('a')
                for (let i = 0; i < anchors.length; i++) {
                    if (anchors[i].textContent.includes('Grades')) {
                        page = anchors[i].href
                        break
                    }
                }
                // parse href contents
                const response = await fetch(page)
                const html = await response.text()
                const GradesDOM = new DOMParser().parseFromString(html, 'text/html')
                gradeRows = GradesDOM.querySelector('tbody').querySelectorAll('tr')
                console.log(`[WW—AL] 'Grades' page data parsed successfully`)
            }
            catch (err) {
                console.error(`[WW—AL] 'Grades' page data not received/parsed successfully\n${err}`)
            }

            if (gradeRows) {
                const header = table.querySelector('thead tr')
                const setRows = table.querySelector('tbody').querySelectorAll('tr')
                function findMatch(rows, nameToMatch, col)
                {
                    for (const row of rows) {
                        const found = row.querySelector('th a')?.textContent
                        if (found == nameToMatch) {
                            const cells = row.querySelectorAll('td')
                            col-- // because leftmost col is 'th'
                            let cellText
                            if (col < cells.length) {
                                let check = cells[col]
                                // dig until text is found
                                while (!cellText) {
                                    try {
                                        cellText = check.textContent
                                    }
                                    catch {
                                        try {
                                            check = check.firstChild
                                        }
                                        catch {
                                            cellText = 'error'
                                        }
                                    }
                                }
                            }
                            else {
                                cellText = ''
                            }
                            return cellText
                        }
                    }
                    return 'not found in gradebook'
                }
                function newCell(row, type, pos, str, style)
                {
                    const el = document.createElement(type)
                    el.textContent = str
                    if (style)
                        el.classList.add(style)
                    row.insertBefore(el, row.children[pos])
                }

                // modify table
                setRows.forEach(row =>
                {
                    const assignment = row.querySelector('a')?.textContent || row.querySelector('td')?.textContent
                    const outOf = findMatch(gradeRows, assignment, 3)
                    const percent = findMatch(gradeRows, assignment, 1)
                    let style
                    if (percent.includes('%'))
                        style = percent == '100%' ? 'GREEN' : percent != '0%' ? 'BLUE' : null

                    newCell(row, 'td', 1, outOf)
                    newCell(row, 'td', 2, percent, style)
                })
                newCell(header, 'th', 1, 'Problems')
                newCell(header, 'th', 2, 'Score')
            }
        })(table)
    }
})


async function grabSettings()
{
    const data = await chrome.storage.sync.get(['settings'])
    return data.settings
}
