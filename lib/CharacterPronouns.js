'use strict';


const nounCase = {
    NOM: 0, //Nominative, subject, e.g. "she"
    ACC: 1, //Accussative, object, e.g. "her",
    POS: 2, //Possessive
    REF: 3 //Reflexive, e.g. "herself"
};

const samplePronouns = [
    ["she", "her", "her", "herself"],
    ["he", "him", "his", "himself"],
    ["they", "them", "their", "themself"],
    ["it", "it", "its", "itself"],
    ["xe", "xem", "xer", "xerself"]
];

let testPronouns = samplePronouns[Math.floor(Math.random()*samplePronouns.length)];
let testName = "Zaz"

let sampleSentence = `${testName} used the tool that ${testPronouns[nounCase.POS]} friend gave ${testPronouns[nounCase.ACC]} because ${testPronouns[nounCase.NOM]} couldn't make it ${testPronouns[nounCase.REF]}.`

console.log(sampleSentence)

