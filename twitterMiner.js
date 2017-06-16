let Twitter = require('twitter');
let fs = require('fs');
let Processor  = require('./processor')
let config = require('./settings')

class Miner {

    constructor(processor) {
        this.processor = processor
        this.client = new Twitter({
            consumer_key: config.twitterCredentials.consumer_key,
            consumer_secret: config.twitterCredentials.consumer_secret,
            access_token_key: config.twitterCredentials.access_token_key,
            access_token_secret: config.twitterCredentials.access_token_secret,
        })
    }


    mine() {
        let reset = 5000;
        this.getRateLimit((limit) => {
            console.log(this.timeToRateLimitReset(limit.reset)/ 60000 + " mins") 
            if (limit.remaining < 5) {
                reset = this.timeToRateLimitReset(limit.reset) + 5000
            } 
                this.callApi(() => {
                    setTimeout(this.mine.bind(this), reset)
                })
        })
    }

    mineOptimized() {
        this.getRateLimit((limit) => {
            let callsLeft = limit.remaining
            let timeToReset = this.timeToRateLimitReset(limit.reset)
            let interval = this.getCallInterval(callsLeft, timeToReset)
            console.log("\nCalls left: " + limit.remaining + "\nTime to reset: " + (timeToReset / 60000) + "\ninterval: " + interval / 1000)
            this.callApi(() => {
                setTimeout(this.mineOptimized.bind(this), interval)
            })
        })
    }

    getCallInterval(callsLeft, timeToReset) {
        // If there are 0 calls left, set timeout interval to the time
        // left until our rate-limit is reset. Else, calculate optimal
        // time between calls
        return callsLeft > 1 ? this.getMsBetweenCalls(callsLeft, timeToReset) : timeToReset
    }

    getMsBetweenCalls(callsLeft, msReset) {
        // given ms to API call reset and number of calls left in our 15-minute window, 
        // return speed to make calls to optimize available rate-limit
        return msReset / callsLeft
    }

    callApi(next) {
        this.getTweets((tweets) => {
            let pruned = this.processor.toPruned(tweets.statuses)
            this.writeTweets(pruned)
            return next()
        })
    }

    writeTweets(tweets) {
        fs.appendFile('tweets.json', JSON.stringify(tweets, null, 4), 
            function(err) {
                if (err) {
                    console.log(err);
                }
            });
    }

    getTweets(next) {
        // get 100 tweets in 1340mi radius from the center of the US
        
        this.client.get('search/tweets', { count: 100, geocode: "39.828200,-98.579500,1340mi"}, 
        (err, tweets, res) => {
            if (err)
                next(err)
            next(tweets);
        })
    }

    getRateLimit(next) {
        this.client.get('application/rate_limit_status', 
        (err, status, res) => {
            if (err)
                return next(err)
            return next(status.resources.search['/search/tweets']);
  
        })
    }

    timeToRateLimitReset(reset) {
    
        // ms until rate-limit reset 
        return Math.abs((reset * 1000) - (new Date).getTime())
    }
    

    streamTweets() {
        this.client.stream('statuses/filter', { track: 'Donald Trump'}, 
        function(stream) {
            stream.on('data', function(tweet) {
                fs.appendFile('tweets.json', JSON.stringify(tweet, null, 4), 
                function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            })
            stream.on('error', function(err) {
                console.log(err)
            })
        })
    }
}
// let p = new Processor()
let miner = new Miner(new Processor)
// let tweets = miner.getTweets()
// let pruned = p.prune(tweets, ['id', 'user.location', 'geo', 'text'])
// console.log(pruned)

module.exports = Miner

miner.mineOptimized()