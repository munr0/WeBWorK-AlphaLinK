window.addEventListener("load", () =>
{
    const table = document.querySelector('table')

    // problems page
    if (table && table.querySelector('caption') && table.querySelector('caption').textContent.includes("Problems")) {
        const rows = table.querySelector('tbody').querySelectorAll('tr')

        rows.forEach(row =>
        {
            const cells = row.querySelectorAll('td')
            if (cells[4].textContent.includes("100%"))
                row.classList.add("CORRECT")
            else if (cells[2].textContent == 0)
                row.classList.add("INCORRECT")
            else if (cells[1].textContent != 0)
                row.classList.add("INPROGRESS")
        })
    }

    // course page
    else if (table && table.querySelector('caption') && table.querySelector('caption').textContent.includes("Homework Sets")) {
        (async (table) =>
        {
            let gradeRows
            try {
                //get page link
                let page
                const anchors = document.querySelectorAll('a')
                for (let i = 0; i < anchors.length; i++) {
                    if (anchors[i].textContent.includes("Grades")) {
                        page = anchors[i].href
                        break
                    }
                }
                // parse href contents
                const response = await fetch(page)
                const html = await response.text()
                const GradesDOM = new DOMParser().parseFromString(html, 'text/html')
                gradeRows = GradesDOM.querySelector('tbody').querySelectorAll('tr')
                console.log("[WW—AL] 'Grades' page data parsed successfully.")
            }
            catch (err) {
                console.error(`[WW—AL] 'Grades' page data not received/parsed successfully. ${err}`)
            }

            if (gradeRows) {
                const header = table.querySelector('thead tr')
                const setRows = table.querySelector('tbody').querySelectorAll('tr')
                function findMatch(rows, nameToMatch, col)
                {
                    for (const row of rows) {
                        if (row.querySelector('th a')) {
                            const found = row.querySelector('th a').textContent
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
                                                cellText = "error"
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
                    }
                    return "not found in gradebook"
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
                    const assignment = row.querySelector('a').textContent
                    const outOf = findMatch(gradeRows, assignment, 3)
                    const percent = findMatch(gradeRows, assignment, 1)
                    let style
                    if (percent.includes('%'))
                        style = percent == "100%" ? "GREEN" : "BLUE"

                    newCell(row, 'td', 1, outOf)
                    newCell(row, 'td', 2, percent, style)
                })
                newCell(header, 'th', 1, "Problems")
                newCell(header, 'th', 2, "Score")
            }
        })(table)
    }
})
