const keys = document.querySelectorAll('.key')
const display_input = document.querySelector('.display .input')
const display_output = document.querySelector('.display .output')

let input = ""
let input2 = "" 

beeper=new AudioContext() // browsers limit the number of concurrent audio contexts, so you better re-use'em

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
   
    if('1234567890.=+-*/%()'.indexOf(event.key) > -1) keyPress(event.key)
    else if(event.key === 'Enter') keyPress('=')
    else if (event.key === 'Backspace') keyPress('backspace')
    else if (event.key === 'Escape') keyPress('clear')  
});

// listeners for modal
const modal = document.querySelector('#modal')
// const openModal = document.querySelector('.openModal')
const closeModal = document.querySelector('.close-button')

function openModal() {
    console.log("open modal")
    modal.showModal()
    closeModal.focus()
    
}

// openModal.addEventListener('click', () => {
//     modal.showModal();
// })

closeModal.addEventListener('click', () => {
    modal.close();
})


// process button / key presses
function keyPress(value) {
    
    console.log("button:", value)
   
    if (value === "clear") {
        input = ""
        input2 = ""
        display_input.innerHTML = ""
        display_output.innerHTML = "0"
    } else if (value === 'backspace') {
        input = input.slice(0, -1)
        input2 = input2.trim().slice(0, -1)
        // display_input.innerHTML = formatInput(input)
        display_input.innerHTML = formatInput(input2)
    } else if (value === "=") {
        try {
        let result = evaluate(input2)
        display_output.innerHTML = formatOutput(result);
        } catch (error) {
            beep(30, 120, 25)
            console.log("error:", error.message)
            let temp = display_output.innerHTML
            setTimeout(() => display_output.innerHTML = temp, 1000)
            display_output.innerHTML = ` <span class="error">error</span> ` //`<span class="error">Error!</span>`;
        }
    } else if (value === "brackets") {
        // open or close bracket?
        if(input.lastIndexOf('(') <= input.lastIndexOf(')')) {
            if(!validInput('(')) return
            input += '('
            input2 += '('
        }
        else {
            if(!validInput(')')) return
            input += ')'   
            input2 += ')'
        }
    
        // display_input.innerHTML = formatInput(input);
        display_input.innerHTML = formatInput(input2);
        
    } else if (value === '-') {
        // allow for negative numbers. i.e. a - that follows an operator
        // # will proxy for - where it's for neg num

        let previousChunk = input2.trim().split(' ').pop()
        console.log("minus: prevChunk:", previousChunk)
        if('+-*/('.includes(previousChunk)) value = '#'

        if(!validInput(value)) return
        input += value;
        input2 += formatValue(value);
        
        // display_input.innerHTML = formatInput(input);
        display_input.innerHTML = formatInput(input2);

    } else {

        if(!validInput(value)) return
        input += value;
        input2 += formatValue(value);
        // display_input.innerHTML = formatInput(input);
        display_input.innerHTML = formatInput(input2);
    }
    
    console.log('input:', input)
    console.log('input2:', input2)
}

function formatValue(value) {

    if('+*/-'.indexOf(value) > -1) return pad(value)
    else return value
    
}

function pad(value) {
    return ' ' + value + ' '
}

function backspace() {
    input = input.slice(0, -1)
    input2 = input2.trim().slice(0, -1)
    display_input.innerHTML = formatInput(input)
}



// validate input against rules
function validInput(value) {
    //allow neg numbers
    //disallow consecutive decimal points or more than one in the same chunk
    // percent can't follow a space or percent or operator, must be after a number
    // an operator must follow percent
    // don't modify the orig input with percent, just replace all when evaluated
    
    // mostly: operators can only follow a number ) or %
    // - and follow another operator in which case it should form a neg number or add a +/- key
    // percent must be last and followed by and operator
    //operators must follow a number . ) % i.e. not another operator but - can follow and operator
    //if minus follows an operator it should be next to the num
    // if neg num operator must be followed by digits or open bracket

    // to do operator or percent can follow a close bracket
    // automagically close brackets at the end if last one missing?
    
    console.log("validInput:", value)

    let previousChunk = input2.trim().split(' ').pop()
    console.log("previous chunk:", previousChunk)
    let previousChar = previousChunk.trim().split(' ').pop().slice(-1)
    console.log('previous char:', previousChar)


    switch (value) {
        // case '-':

        case '.':   // no more than 1 decimal point per chunk
            if(previousChunk.includes('.')) return false
            if(')'.indexOf(previousChar) > -1) return false
            return true
        case '%':   // must be last the end of a number chunk
        
            console.log('%')
            console.log('previousChar', previousChar)
            if(previousChar === '') return false
            if('1234567890.)'.includes(previousChar)) return true
        
            // if(previousChunk.includes('%')) return false
            // let previousChar = previousChunk.trim().split(' ').pop().slice(-1)
            // console.log('previousChar:', previousChar)
            // if('+-*/('.includes(previousChar)) return false
            // return true
            break
        case '(':
            // open bracket valid only after an operator or first thing
            console.log("openBracket", previousChunk)
            if('+-*/#'.includes(previousChar)) return true
            break
        case ')':
            // close bracket can't follow an operator 
            // no need to check for open bracket as this not called unless open bracket somewhere before 
            // if close braket immediately after open bracket cancel open bracket
            console.log('input2', input2)
            console.log('previous item:', input2.trim().split(' ').pop())
            console.log("is ( valid?")
            if(previousChar === '(') {
                backspace()
                return false
            }
            if('+-*/'.includes(previousChunk)) return false
            return true
            break
        case '#':
            if('(+-*/'.indexOf(previousChunk) !== -1) return true
            break
        default:
            if('0123456789'.includes(value)) {
                console.log("num:", previousChar)
                console.log(')'.indexOf(previousChar) === -1)
                if(')'.indexOf(previousChar) === -1 ||
                    previousChar === ''
                ) return true
            }
            else if('+-*/') {
                console.log("operators:", value)
                console.log("previousChar:", previousChar)
                if('+-*/#'.indexOf(previousChar) === -1) return true
            }
            else {
                console.log('unhandled case:', value)
                beep(60, 80, 25)
                return false
            }
            break
    }


    console.log(input)
    beep(20, 120, 25)
    return false;
}



function evaluate(input) {
    //let result = eval(applyPercent(input))    // note eval safe here by can be dangerous
    let revisedInput = input
        .replaceAll('%','/100')
        .replaceAll('#', '-')
    
    console.log("evaluate:", revisedInput)
    return eval(revisedInput)
}





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


function formatInputOrig(input) {
    
    let formattedInput = [...input]

    for(let i=0; i < formattedInput.length; ++i) {
        if(formattedInput[i] === "*") {
            formattedInput[i] = ` <span class="operator">x</span> `
        } else if(formattedInput[i] === "/") {
            formattedInput[i] = ` <span class="operator">÷</span> `
        } else if(formattedInput[i] === "+") {
            formattedInput[i] = ` <span class="operator">+</span> `
        } else if(formattedInput[i] === "-") {
            formattedInput[i] = ` <span class="operator">-</span> `
        } else if(formattedInput[i] === "(") {
            formattedInput[i] = `<span class="brackets">(</span>`
        } else if(formattedInput[i] === ")") {
            formattedInput[i] = `<span class="brackets">)</span>`
        } else if(formattedInput[i] === "% ") {
            formattedInput[i] = `<span class="percent">%</span> `
        }
    }

    return formattedInput.join('')
}


// insert 1,000s commas
function formatOutput(output) {
    
    // loop right to left through the integer part of a number to insert commas
    // edge cases: numbers is infinite, number is negative

    if(!isFinite(output)) return output

    let formattedOutput = output.toString()
    let decimalPosition = formattedOutput.indexOf('.')

    let startPos =  decimalPosition > -1 ? decimalPosition -3 : formattedOutput.length -3  //exclude decimal portion
    let endPos = isNaN(formattedOutput[0]) ? 1 : 0  //chk for neg num
    
    formattedOutput = [...formattedOutput]

    for(let i = startPos; i > endPos; i-= 3) {
        formattedOutput.splice(i, 0, ',')
    }

    return formattedOutput.join('')
}




