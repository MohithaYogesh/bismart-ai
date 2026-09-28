import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const knowledgeDocuments = mysqlTable("knowledgeDocuments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 500 }).notNull(),
  sourceOrganization: varchar("sourceOrganization", { length: 160 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  textChunks: text("textChunks").notNull(),
  metadata: text("metadata"),
  status: mysqlEnum("status", ["indexed", "review", "failed"]).default("indexed").notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = typeof knowledgeDocuments.$inferInsert;

export const userQueries = mysqlTable("userQueries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  query: text("query").notNull(),
  intent: varchar("intent", { length: 80 }),
  response: text("response"),
  sources: text("sources"),
  status: mysqlEnum("status", ["answered", "needs_detail", "unknown"]).default("answered").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserQuery = typeof userQueries.$inferSelect;
export type InsertUserQuery = typeof userQueries.$inferInsert;

export const productScans = mysqlTable("productScans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  productName: varchar("productName", { length: 255 }),
  imageUrl: text("imageUrl"),
  ocrText: text("ocrText"),
  extractedFields: text("extractedFields"),
  claims: text("claims"),
  complianceStatus: mysqlEnum("complianceStatus", ["supported", "review", "issue"]).default("review").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductScan = typeof productScans.$inferSelect;
export type InsertProductScan = typeof productScans.$inferInsert;

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  scanId: int("scanId"),
  productName: varchar("productName", { length: 255 }),
  reportUrl: text("reportUrl"),
  summary: text("summary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
