/* Retrieve .csv for substring replacement */
{
    var replacements
    const CSV = chrome.runtime.getURL("resources/replacements.csv")

    fetch(CSV)
        .then(response =>
        {
            if (!response.ok)
                throw new Error(`Error fetching replacements.csv. ${response.status}`)
            return response.text()
        })
        .then(data =>
        {
            replacements = data.split('\n')         // make array
                .filter(row => row.length > 2)      // remove empty rows (", ")
                .map(row => row.replace(/\r+$/, '') // get rid of newlines
                    .split(','))                    // make 2D
                .concat([['\\,', ' ']])             // append this (no commas in .csv)

            console.groupCollapsed("[WW—AL] TeX Replacements")
            console.table(replacements)
            console.groupEnd()
        })
        .catch(err => alert(`replacements.csv not retrieved successfully. ${err}`))
}


document.addEventListener("click", function (e)
{
    if (document.activeElement.classList.contains("MathJax")) {
        e.preventDefault()
        console.log("MathJax element clicked")
        navigator.clipboard.writeText("[OUTDATED] WebWorK AlphaLinK does not recognize the DOM structure of the MathJax context menu.") // gets overwritten
            .then(() =>
            {
                /*  The following code gets the source TeX by opening a menu and selecting an option to copy the TeX to the clipboard.
                    This happens too quick for the user to even see the menu pop up. */

                document.activeElement.dispatchEvent(new MouseEvent("contextmenu", { button: 2 }))
                const menu = document.querySelector(".CtxtMenu_Menu")
                let menuItems = document.querySelectorAll(".CtxtMenu_MenuItem:not(.CtxtMenu_MenuRule)")

                for (let i = 0; i < menuItems.length; i++) {
                    menu.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 40 }))
                    if (menuItems[i].textContent.includes("Copy to Clipboard")) {
                        break
                    }
                }
                menuItems = document.querySelectorAll(".CtxtMenu_MenuItem") // now with submenu
                for (let j = 0; j < menuItems.length; j++) {
                    if (menuItems[j].textContent.includes("TeX Commands")) {
                        menuItems[j].dispatchEvent(new KeyboardEvent("keydown", { keyCode: 13 }))  // this *should* copy TeX
                        break
                    }
                }

                navigator.clipboard.readText().then(launchWolfram)
            })
            .catch(alert)
    }
})


function launchWolfram(TeX)
{
    const problem = tidyTeX(TeX)
    const URL = "https://www.wolframalpha.com/input?i=" + encodeURIComponent(problem)

    if (false)
        window.open(URL)
    else
        chrome.runtime.sendMessage({ type: 'open_side_panel', data: URL })
}


/* Turn TeX into something simple for online calculators */
function tidyTeX(problem)
{
    // handle \frac and \dfrac
    problem = problem.replace(/\\dfrac/g, "\\frac")
    let idx = problem.indexOf("\\frac")
    while (idx != -1) {
        problem = problem.slice(0, idx) + problem.slice(idx + 5).trim()
        // check if \frac is shorthand syntax
        if (problem[idx] == '{') {
            let depth = 1
            while (depth) {
                idx++
                if (problem[idx] == '{')
                    depth += 1
                else if (problem[idx] == '}')
                    depth -= 1
                else if (!problem[idx])
                    console.error("Unexpected \\frac syntax.")
            }
        }
        problem = problem.slice(0, idx + 1) + '/' + problem.slice(idx + 1)
        idx = problem.indexOf("\\frac")
    }

    // handle matrices
    ////ADD CODE

    // use `replacements` to change TeX commands to plain text
    replacements.forEach(pair =>
    {
        problem = problem.split(pair[0]).join(pair[1])
    })
    problem = problem.trim()

    // remove ending chars that aren't part of the math
    while (problem.startsWith('(') && problem.endsWith(')'))
        problem = problem.slice(1, -1).trim()
    while (problem.endsWith('=') || problem.endsWith(',') || problem.endsWith('.') || problem.endsWith(':') || problem.endsWith('\\'))
        problem = problem.slice(0, -1).trim()

    return problem
}
