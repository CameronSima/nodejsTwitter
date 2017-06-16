let spawn = require('child_process').spawn;
let fs = require('fs');

class Processor {

    constructor() {
        this.data = [];
    }

    pruned() {
        return this.data.map((tweet) => {
            return new ProcessedTweet(
                tweet.user.location,
                tweet.text,
                tweet.id,
                tweet.created_at,
                tweet.geo
            )
        })
    }

    toPruned(tweets) {
        return tweets.map((tweet) => {
            return {
                location: tweet.user['location'],
                body: tweet['text'],
                id: tweet['id'],
                date: tweet['created_at'],
                geo: tweet['geo'],
                coordinates: tweet['coordinates'],
                hashtags: tweet.entities['hashtags']
            }
        })
    }

    prune(tweet, propsToKeep) {
        console.log(Object.keys(tweet))
        return Object.keys(tweet)
            .filter(key => propsToKeep.includes(key))
            .reduce((obj, key) => {
                obj[key] = propsToKeep[key]
                return obj
            }, {})
    }

    getSentiments(tweets, next) {
        let py = spawn('python', ['get_sentiments.py']);
        py.stdin.write(JSON.stringify(tweets));
        py.stdin.end();
        py.stdout.on('data', (data) => {
            this.data.push(data);
        })
        py.on('end', () => {
            next(this.data);
        })
    }
}

module.exports = Processor