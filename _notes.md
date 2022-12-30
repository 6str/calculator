https://www.youtube.com/watch?v=_x8mNUBhLSk

todos
overflow input/output screen

backspace font awesome

favicon


code currently formats the input/output each key press parsing through the input var. seems a bit inefficient, and want the input var to be formatted, or at least have space so i can split the chunks for validation logic e.g. not two decimal points in the same chunk and allow a neg number 

a negative can follow another operator, but a number must follow a negative
percent must immediately follow a num

add commas: check if string starts with - to avoid -,123

get better font for backspace key

what to do about +/- for neg numbers
overflow an issue on keys and screen

+/-, ^ , sqr, sqrt, n!

changes
colours 
cleared : output set to 0 instead of ""
try switch instad of ifs?
change backspace key
much simpler if/else logic for open close brackets
restyled a bit the output/display, borders and colours
slightly simplified/cleaner cleanInput function
check number is finite before adding commas
added timed error output promt when unable to evaluate expression
rename functions to format instead of clean as that seemed a better fit
added error beep
simplified 1000s commas logic : don't split on decimals, and improved to accounf for neg nums



eval : 
    eval(x: string): any
    A String value that contains valid JavaScript code.
    Evaluates JavaScript code and executes it.

    evaluates expression/text as javascript code.
    would be dangerous to use in some situations were it could be exploited to run malicious code.
    Safe enough here as it can only eval maths and just runs on a user's own machine


