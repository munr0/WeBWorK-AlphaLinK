/* Handle special keypresses */
document.addEventListener('keydown', (e) =>
{
    const fields = document.querySelectorAll('input[type="text"], input[type="checkbox"], input[type="radio"], select')
    const field = document.activeElement
    const text = field.value || field.textContent
    const cursorPos = field.selectionStart
    const Rchar = text.charAt(cursorPos)
    const Lchar = text.charAt(cursorPos - 1)

    // open side panel with hits F10 or ctrl-b
    if (e.key === 'F10' || e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        chrome.runtime.sendMessage({ type: 'toggle_side_panel' })
    }

    // go to previous problem with ctrl-shift-enter
    else if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        const buttons = document.querySelectorAll('a')
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent.includes('Previous Problem')) {
                buttons[i].click()
                break
            }
        }
    }

    // go to next problem with shift-enter
    else if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        const buttons = document.querySelectorAll('a')
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent.includes('Next Problem')) {
                buttons[i].click()
                break
            }
        }
    }

    // keyboard left-click
    else if (e.altKey && e.key === 'Enter') {
        e.preventDefault()
        document.activeElement.click()
    }

    // submit answer with ctrl-enter
    else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        (document.getElementById('submitAnswers_id') || document.getElementById('checkAnswers_id'))?.click()
    }

    // cycle through fields with tab/shift-tab
    else if (e.key === 'Tab') {
        e.preventDefault()
        let dir = 1
        if (e.shiftKey)
            dir = -1
        let nextField
        for (let i = 0; i < fields.length; i++) {
            const test = fields[i]
            if (test === field) {
                let next = i + dir
                if (next === fields.length)
                    next = 0
                else if (next === -1)
                    next = fields.length - 1
                nextField = fields[next]
                break
            }
        }
        nextField ? nextField.focus() : fields[0].focus()
        if (isTextInput(nextField))
            nextField.setSelectionRange(nextField.value.length, nextField.value.length)
    }

    // select focused w/o mouse
    else if (e.key === '\\') {
        field.click() // doesn't work on <select>
    }

    // clear field with ctrl-bksp
    else if (e.ctrlKey && e.key === 'Backspace') {
        e.preventDefault()
        field.value = ''
    }

    // pulldown previous textbox entry with ctrl-down
    else if (e.ctrlKey && e.key === 'ArrowDown') {
        e.preventDefault()
        let bringDown = fields[0].value // first box will just copy itself
        for (let i = 1; i < fields.length; i++) {
            const test = fields[i]
            if (test === field) {
                bringDown = fields[i - 1].value
                break
            }
        }
        field.value = text.substring(0, cursorPos) + bringDown + text.substring(cursorPos)
        field.setSelectionRange(cursorPos + bringDown.length, cursorPos + bringDown.length)
    }

    // add closing paren when '(' typed
    else if (e.shiftKey && e.key == '(' && enableParen) {
        // don't add closing paren if there is text to right
        if (Rchar && !(Rchar == ' ' || Rchar == ')'))
            return false
        // add close paren, move cursor back
        const replace = text.substring(0, cursorPos) + ')' + text.substring(cursorPos)
        field.value = replace
        field.setSelectionRange(cursorPos, cursorPos)
    }

    // skip close paren if we have it already
    else if (e.shiftKey && e.key === ')' && enableParen) {
        if (Rchar === ')') {
            e.preventDefault()
            field.setSelectionRange(cursorPos + 1, cursorPos + 1)
        }
    }

    // del both open and close paren with backspace
    else if (e.key === 'Backspace' && enableParen) {
        if (Lchar === '(' && Rchar === ')') {
            const replace = text.substring(0, cursorPos) + text.substring(cursorPos + 1)
            field.value = replace
            field.setSelectionRange(cursorPos, cursorPos)
        }
    }
})


/* Special paste (handles W|A "copyable plain text") */
document.addEventListener('dblclick', (e) =>
{
    const field = document.activeElement
    if (isTextInput(field) && !field.value) {
        navigator.clipboard.readText().then(str =>
        {
            // process to get the exact value answer if there is one
            const index = str.lastIndexOf('=') != -1 ? str.lastIndexOf('=') : str.lastIndexOf('≈')
            if (index !== -1) {
                str = str.substring(index + 1)
                if (str.indexOf('≈') !== -1)
                    str = str.substring(0, str.indexOf('≈'))
            }
            str = str.replace(/π/, 'pi').replace(/∞/, 'inf').replace(/constant/, 'c')
            field.value = field.value + str
            field.setSelectionRange(field.value.length, field.value.length)
        })
    }
})


function isTextInput(el)
{
    return el?.tagName === 'INPUT' && el?.type === 'text'
}

async function grabSettings()
{
    const data = await chrome.storage.sync.get(['settings'])
    return data.settings
}

// the other code won't try to access this early enough that async is an issue
let enableParen
(async () =>
{
    const settings = await grabSettings()
    enableParen = settings.paren
})()
