let assert = require('assert');
let Miner = require('../twitterMiner');

console.log(Miner)

describe('Processor test', () => {
    describe('timeToRateLimitReset()', () => {
        it('Calculates differences from a time in the futute,' +
        ' supplied in seconds, from current time in ms', () => {
            let miner = new Miner
            let time1 = (new Date).getTime()
            let time2 = 1497635468044 
            let expected = (time1 - time2) 
            assert.equal(expected, miner.timeToRateLimitReset(time2/1000))
        })
    })


})