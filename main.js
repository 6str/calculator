const keys = document.querySelectorAll('.key')
const display_input = document.querySelector('.display .input')
const display_output = document.querySelector('.display .output')
const modal = document.querySelector('#modal')
const closeModal = document.querySelector('.close-button')

let input = ""

beeper=new AudioContext()

function beep(vol, freq, duration){
  v=beeper.createOscillator()
  u=beeper.createGain()
  v.connect(u)
  v.frequency.value=freq
  v.type="square"
  u.connect(beeper.destination)
  u.gain.value=vol*0.01
  v.start(beeper.currentTime)
  v.stop(beeper.currentTime+duration*0.001)
}

// listeners: key button clicked
for (let key of keys) {

    const value = key.dataset.key
    key.addEventListener('click', () => {
        keyPress(value)
     })
}

// listener: keyboard key pressed
document.addEventListener("keydown", (event) => {
   
    if('1234567890.=+-*/%()'.includes(event.key)) keyPress(event.key)
    else if(event.key === 'Enter') keyPress('=')
    else if (event.key === 'Backspace') keyPress('backspace')
    else if (event.key === 'Escape') keyPress('clear')
});

// listener close modal button
closeModal.addEventListener('click', () => {
    modal.close();
})

// open credits modal
function openModal() {
    modal.showModal()
    closeModal.focus()
}

// set output window data. longer output forces smaller fontsize
function setOutput(data) {
    if(data.length < 14) {
        display_output.style.fontSize = "3.0rem"
    } else if (data.length < 20) {
        display_output.style.fontSize = "2.0rem"
    } else {
        display_output.style.fontSize = "1.5rem"
    }
    display_output.innerHTML = data;
}

// operators get padding
function formatValue(value) {
    if('+*/-'.includes(value)) return pad(value)
    else return value
}

// add a space before and after
function pad(value) {
    return ' ' + value + ' '
}

// delete a character from input
function backspace() {
    input = input.trim().slice(0, -1).trim()
    display_input.innerHTML = formatInput(input)
}

// evaluate the input expression and set output
function evaluate(input) {

    input = input
        .replaceAll('%','/100')
        .replaceAll('#', '-')

    console.log("evaluate:", input)

    try {
        setOutput(formatOutput(eval(input))) //eval can be evil but safe here
    } catch (error) {
        // if javascript can't evaluate input flash error on screen for 1 second
        beep(30, 120, 25)
        console.error("error:", error.message)
        let temp = display_output.innerHTML
        setTimeout(() => display_output.innerHTML = temp, 1000)
        display_output.innerHTML = ` <span class="error">error</span> `
    }
}

// process button / key presses
function keyPress(value) {
    
    console.log("button:", value)
   
    if (value === "clear") {
        input = ""
        display_input.innerHTML = ""
        display_output.innerHTML = "0"
    } else if (value === 'backspace') {
        backspace()
        display_input.innerHTML = formatInput(input)
    } else if (value === "=") {
        evaluate(input)
    } else if (value === "brackets") {
        // open or close bracket?
        if(input.lastIndexOf('(') <= input.lastIndexOf(')')) {
            if(!validInput('(')) return
            input += '('
        }
        else {
            if(!validInput(')')) return
            input += ')'
        }
    
        display_input.innerHTML = formatInput(input);
        
    } else if (value === '-') {
        // allow for negative numbers. i.e. a - that follows an operator
        // # will proxy for - where it's for neg num
        let previousChunk = input.trim().split(' ').pop()
        console.log("minus: prevChunk:", previousChunk)
        let previousChar = previousChunk.trim().split(' ').pop().slice(-1)

        if('+-*/('.includes(previousChar)) value = '#'

        if(!validInput(value)) return
        input += formatValue(value);
        display_input.innerHTML = formatInput(input);

    } else {

        if(!validInput(value)) return
        input += formatValue(value);
        display_input.innerHTML = formatInput(input);
    }
    
    console.log('input:', input)
}

// validate input against rules
function validInput(value) {
    console.log("validInput:", value)

    // the previous character and previous chunk of characters are needed to validate new input
    let previousChunk = input.trim().split(' ').pop()
    console.log("previous chunk:", previousChunk)
    let previousChar = previousChunk.trim().split(' ').pop().slice(-1)
    console.log('previous char:', previousChar)

    switch (value) {
        case '.':   
            // no more than 1 decimal point per chunk
            // decimal can't follow a close bracket
            if(previousChunk.includes('.')) break //return false
            if(previousChar === ')') break //return false
            return true
        case '%':   
            // must be at the end of a chunk of digits or close bracket
            if(previousChar === '') break   // n.b. .includes will return true for empty string
            if('1234567890.)'.includes(previousChar)) return true
            break
        case '(':
            // open bracket valid only after an operator, neg num #, or first thing
            if('+-*/#'.includes(previousChar)) return true
            break
        case ')':
            // if close bracket immediately after open bracket clear open bracket
            // close bracket can't follow an operator or neg num #
            if(previousChar === '(') {
                backspace()
                return false
            }
            if('+-*/#'.includes(previousChar)) break
            return true
        case '#':   // # is a proxy for a minus for negative number
            // valid first thing, after open bracket and after an operator
            if('(+-*/'.includes(previousChar)) return true
            break
        default:
            // digits can follow anything but a close bracket or %
            if('0123456789'.includes(value)) {
                if(')%'.includes(previousChar) && previousChar !== '') break
                return true
            }
            // operators can't follow an operator or a minus for neg num # or a . on its own
            else if('+-*/') {
                if('+-*/#('.includes(previousChar)) break
                if(previousChunk === '.') break
                return true
            }
            else {
                console.log('unhandled case:', value)
                beep(60, 80, 25)
            }
    }

    console.log('invalid input:', value)
    beep(20, 120, 25)
    setTimeout(() => beep(20, 80, 25), 40)
    return false;
}

// format the input expression into human readable input HTML
function formatInput(input) {
    
    let formattedInput = [...input]

    for(let i=0; i < formattedInput.length; ++i) {
        
        switch (formattedInput[i]) {

        case '*':
            formattedInput[i] = ` <span class="operator">x</span> `
            break
        case '/':
            formattedInput[i] = ` <span class="operator">÷</span> `
            break
        case '+':
            formattedInput[i] = ` <span class="operator">+</span> `
            break
        case '-':
            formattedInput[i] = ` <span class="operator">-</span> `
            break
        case '(':
            formattedInput[i] = `<span class="brackets">(</span>`
            break
        case ')':
            formattedInput[i] = `<span class="brackets">)</span>`
            break
        case '%':
            formattedInput[i] = `<span class="percent">%</span> `
            break
        case '#':
            formattedInput[i] = `<span class="negNum">-</span>`
        }
    }

    return formattedInput.join('')
}

// format the output number to human readable
function formatOutput(output) {
    
    // insert 1,000s commas
    // loop right to left through the integer part of a number to insert commas
    // edge cases: number is infinite, some numbers expressed with e notation
    // no commas for decimal and e portion of a number

    if(!isFinite(output)) return output
    
    let formattedOutput = output.toString()
    let startPos

    // if e and no decimal startPos is e pos -3, else it the decimal pos -3
    if(!formattedOutput.includes('.') && formattedOutput.includes('e')) {
        startPos = formattedOutput.indexOf('e') -3
    } else {
        let decimalPosition = formattedOutput.indexOf('.')
        startPos =  decimalPosition > -1 ? decimalPosition -3 : formattedOutput.length -3  
    }

    //chk for neg num as first char is -
    let endPos = isNaN(formattedOutput[0]) ? 1 : 0
    
    formattedOutput = [...formattedOutput]
    
    for(let i = startPos; i > endPos; i-= 3) {
        formattedOutput.splice(i, 0, ',')
    }

    return formattedOutput.join('')
}




