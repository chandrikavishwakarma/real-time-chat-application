const {createClient} = require('redis')
const redisClient = createClient({
    url : process.env.REDIS_URL || "redis://alice:foobared@awesome.redis.server:6380"
})
redisClient.on("error", (err) => {
    console.log("got the error to connect with the redis", err)
})
redisClient.on("connect", ()=>{
    console.log("ready to connect to the redis....")
})
redisClient.on("ready", ()=>{
    console.log("redis has been connected!")
})
module.exports = redisClient;