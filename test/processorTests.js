let assert = require('assert');
let Processor = require('../Processor');

describe('Processor test', () => {
    describe('pruner test', () => {
        it('should remove fields from object', () => {
            let proc = new Processor

            let obj = { user: {
                location: 'Toronto, Ontario',
                id: 345345
                        },
                             text: 'RT @danadearmond: It\'s my birthday 🎉 🎁🎂',
                             someBS: "sdgdfgfdga",
                             id: 875803134819545100,
                             created_at: 'Fri Jun 16 19:51:53 +0000 2017',
                             geo: null }

            let expected = { location: 'Toronto, Ontario',
                             body: 'RT @danadearmond: It\'s my birthday 🎉 🎁🎂',
                             id: 875803134819545100,
                             date: 'Fri Jun 16 19:51:53 +0000 2017',
                             geo: null }

            console.log(proc.toPruned([obj]))
            assert.equal(expected, proc.toPruned([obj]))

        })
    })
})