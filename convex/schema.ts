import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  posts: defineTable({
    message: v.string(),
    userId: v.id("users"),
    privacy: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("friends"),
    ),
    lastUpdate: v.optional(v.string()),
  }).index("byUser", ["userId"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    username: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
