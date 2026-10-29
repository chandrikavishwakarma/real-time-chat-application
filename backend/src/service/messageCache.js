const { prisma } = require("../config/db.js");
const redisClient = require("../config/redis.js");
const CACHE_TTL = 300;
const MESSAGE_LIMIT = 50;
function getConversationKey(userId, otherUserId) {
  const ids = [Number(userId), Number(otherUserId)].sort((a, b) => a - b);
  // it return the unique id coversation of sender <-> reciever
  return `chat:messages:${ids[0]}:${ids[1]}`;
}
async function getConversationMessages(userId, otherUserId) {
  const currentId = Number(userId);
  const otherId = Number(otherUserId);
  
  if (
    !Number.isSafeInteger(currentId) ||
    !Number.isSafeInteger(otherId) ||
    currentId <= 0 ||
    otherId <= 0 ||
    currentId === otherId
  ) {
    throw new Error("Invalid conversation IDs");
  }

  const key = getConversationKey(currentId, otherId);

  // 1. Cache-Aside: check Redis first
  if (redisClient.isReady) {
    try {
      const cached = await redisClient.get(key);

      if (cached !== null) {
        console.log("Message cache HIT");
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Redis read error:", error.message);
    }
  }

  // 2. Cache miss: fetch messages from PostgreSQL
  console.log("Message cache MISS(fetch from DB)");

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: currentId, receiverId: otherId },
        { senderId: otherId, receiverId: currentId },
      ],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: MESSAGE_LIMIT,
  });

  // Return messages in chronological order
  messages.reverse();

  // 3. TTL: save messages with a five-minute expiration
  if (redisClient.isReady) {
    try {
      await redisClient.set(key, JSON.stringify(messages), { EX: CACHE_TTL });
    } catch (error) {
      console.error("Redis write error:", error.message);
    }
  }

  return messages;
}

// 4. Cache invalidation helper
async function invalidateConversationCache(userId, otherUserId) {
  const key = getConversationKey(userId, otherUserId);

  if (!redisClient.isReady) return;

  try {
    await redisClient.del(key);
    console.log("Conversation cache invalidated");
  } catch (error) {
    console.error("Redis invalidation error:", error.message);
  }
}

module.exports = {
  getConversationKey,
  getConversationMessages,
  invalidateConversationCache,
};
