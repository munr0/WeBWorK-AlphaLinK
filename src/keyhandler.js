window.addEventListener("load", () =>
{
    // check if WebWorK version is supported
    const supported = chrome.runtime.getManifest().version.split('.').slice(0, 2).join('.')
    const WWversion = document.getElementById("copyright").textContent.match(/ww_version:\s*([\d.]+)/)[1]
    if (WWversion == supported)
        console.info("[WW—AL] Version match.")
    else
        console.warn(`[WW—AL] This build of WebWorK AlphaLink was developed for WebWorK version ${supported}. Performance may be unstable.`)

    // start cursor in the first textbox
    const textBox = document.getElementById("AnSwEr0001")
    if (textBox) {
        textBox.focus()
        if (isInput(textBox))
            textBox.setSelectionRange(textBox.value.length, textBox.value.length)
    }
    else
        console.log("[WW—AL] No textbox to select.")
})


/* Handle special keypresses */
document.addEventListener("keydown", function (e)
{

    const field = document.activeElement
    const text = field.value || field.textContent
    const cursorPos = field.selectionStart
    const Rchar = text.charAt(cursorPos)
    const Lchar = text.charAt(cursorPos - 1)

    // open side panel with hits F9
    if (e.key == "F10") {
        e.preventDefault()
        chrome.runtime.sendMessage({ type: 'open_side_panel', data: "https://www.wolframalpha.com/" })
    }

    // go to previous problem with ctrl-shift-enter
    else if (e.ctrlKey && e.shiftKey && e.key == "Enter") {
        e.preventDefault()
        const buttons = document.querySelectorAll("a")
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent.includes("Previous Problem")) {
                buttons[i].click()
                break
            }
        }
    }

    // go to next problem with shift-enter
    else if (e.shiftKey && e.key == "Enter") {
        e.preventDefault()
        const buttons = document.querySelectorAll("a")
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].textContent.includes("Next Problem")) {
                buttons[i].click()
                break
            }
        }
    }

    // submit answer with ctrl-enter
    else if (e.ctrlKey && e.key == "Enter") {
        e.preventDefault()
        document.getElementById("checkAnswers_id").click()
    }

    // cycle through textboxes with tab
    else if (e.key == "Tab") {
        e.preventDefault()
        let fieldNum = parseInt(field.id.slice(-4))
        fieldNum++
        const nextFieldID = "AnSwEr" + fieldNum.toString().padStart(4, '0')
        let nextField = document.getElementById(nextFieldID)
        if (!nextField)
            nextField = document.getElementById("AnSwEr0001")
        nextField.focus()
        if (isInput(nextField))
            nextField.setSelectionRange(nextField.value.length, nextField.value.length)
    }

    // clear field with backslash
    else if (e.key == "\\") {
        e.preventDefault()
        field.value = ''
    }

    // pulldown previous textbox entry with F9
    else if (e.key == "F9") {
        e.preventDefault()
        // find what the previous text box was and grab its contents
        let fieldNum = parseInt(field.id.slice(-4))
        fieldNum = --fieldNum ? fieldNum : 1
        const prevFieldID = "AnSwEr" + fieldNum.toString().padStart(4, '0')
        const bringDown = document.getElementById(prevFieldID).value
        // insert these contents into current text box
        const replace = text.substring(0, cursorPos) + bringDown + text.substring(cursorPos)
        field.value = replace
        field.setSelectionRange(cursorPos + bringDown.length, cursorPos + bringDown.length)
    }

    // add closing paren when '(' typed
    else if (e.shiftKey && e.key == "(") {
        // don't add closing paren if there is text to right
        if (Rchar && !(Rchar == " " || Rchar == ")"))
            return false
        // add close paren, move cursor back
        const replace = text.substring(0, cursorPos) + ")" + text.substring(cursorPos)
        field.value = replace
        field.setSelectionRange(cursorPos, cursorPos)
    }

    // skip close paren if we have it already
    else if (e.shiftKey && e.key == ")") {
        if (Rchar == ")") {
            e.preventDefault()
            field.setSelectionRange(cursorPos + 1, cursorPos + 1)
        }
    }

    // del both open and close paren with backspace
    else if (e.key == "Backspace") {
        if (Lchar == "(" && Rchar == ")") {
            const replace = text.substring(0, cursorPos) + text.substring(cursorPos + 1)
            field.value = replace
            field.setSelectionRange(cursorPos, cursorPos)
        }
    }
})


/* Special paste */
document.addEventListener("dblclick", function (e)
{
    const field = document.activeElement
    if (isInput(field) && !field.value) {
        navigator.clipboard.readText().then(str =>
        {
            // process to get the exact value answer if there is one
            const index = str.lastIndexOf('=') != -1 ? str.lastIndexOf('=') : str.lastIndexOf('≈')
            console.log(index)
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


function isInput(el)
{
    return el.tagName == "INPUT" && el.type == "text"
}
