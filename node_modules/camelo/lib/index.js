"use strict";

// Dependencies
var ucFirstArray = require("uc-first-array"),
    reEscape = require("regex-escape");

// Constants
var DEFAULT_SPLIT = /[^a-zA-Z0-9]/g;

/**
 * camelo
 * Converts an input string into camel-case style.
 *
 * @name camelo
 * @function
 * @param {String} input The input string.
 * @param {Regex|String|Array} regex A regular expression, a string character or an array of strings used to split the input string.
 * @param {Boolean} uc If `true`, it will uppercase the first word as well.
 * @return {String} The camelized input value.
 */
function camelo(input, regex, uc) {

    regex = regex || DEFAULT_SPLIT;

    var splits = null;

    if (Array.isArray(regex)) {
        regex = new RegExp(regex.map(reEscape).join("|"), "g");
    } else if (typeof regex === "boolean") {
        uc = regex;
        regex = DEFAULT_SPLIT;
    }

    splits = input.split(regex);

    if (uc) {
        return ucFirstArray(splits).join("");
    }

    return splits[0] + ucFirstArray(splits.slice(1)).join("");
}

module.exports = camelo;