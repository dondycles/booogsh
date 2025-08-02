import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    username: v.string(),
    tokenIdentifier: v.string(),
    pfp: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),
  posts: defineTable({
    message: v.string(),
    userId: v.id("users"),
    privacy: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("friends"),
    ),
    lastUpdate: v.optional(v.string()),
    likesCount: v.optional(v.number()),
    commentsCount: v.optional(v.number()),
  }).index("byUser", ["userId"]),
  postLikes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
  })
    .index("byPostAndUser", ["postId", "userId"])
    .index("byPost", ["postId"]),

  comments: defineTable({
    content: v.string(),
    postId: v.id("posts"),
    userId: v.id("users"),
    likesCount: v.optional(v.number()),
  }).index("byPost", ["postId"]),

  commentLikes: defineTable({
    commentId: v.id("comments"),
    userId: v.id("users"),
  })
    .index("byCommentAndUser", ["commentId", "userId"])
    .index("byComment", ["commentId"]),
});
