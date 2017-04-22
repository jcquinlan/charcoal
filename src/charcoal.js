const process = require('process');

const Charcoal = require('./charcoalClass');

/*
// JS Variable Regex test.
http://pythex.org/?regex=(%3F%3Aconst%7Clet%7Cvar)%7B1%7D%20%5Cw%2B%20%3D%20(%3F%3A%27%7C%22)*((%3F%3A%23*)%5B%5Cw%5C(%5C)%2C%5D%2B)(%3F%3A%27%7C%22)*%3B*&test_string=let%20breakpoint%20%3D%201990%0Aconst%20test%20%3D%20%27%2300ff45%27%0Alet%20anything_2%20%3D%20%27%2300ff45%27%3B%0Avar%20blahBlah%20%3D%20%27%2300ff45%27%3B%0Aconst%20blahBlah%20%3D%20%22%2300ff45%22%3B%0Aconst%20blah%20Blah%20%3D%20%22rgb(0%2C255%2C255)%22%3B%0Aconst%20blahBlah%20%3D%20%22rgb(0%2C255%2C255)%22%3B%0Aconst%20blahBlah%20%3D%20%22yellow%22%3B&ignorecase=0&multiline=0&dotall=0&verbose=0
*/

/*
// SCSS Variable Regex test
http://pythex.org/?regex=%5C%24(%5Cw%2B)%3A%20%23*(%5B%5Cw%5C(%5C)%2C%5D%2B)%3B*&test_string=%24varOne%3A%20%23333%3B%0A%24var_two%3A%20blue%0A%24varThree%3A%20rgb(0%2C255%2C255)%3B%0A%24breakpoint%3A%201991%3B%0A&ignorecase=0&multiline=0&dotall=0&verbose=0
*/

const srcFile = process.argv[2];
const destFile = process.argv[3];

const main = new Charcoal(srcFile, destFile);

main.run();