import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  DEMO_PRODUCTS,
  KNOWLEDGE_BASE,
  TRUSTED_SOURCES,
  answerWithFallback,
  demoScanResult,
  recommendStandard,
  retrieveKnowledge,
} from "./bismart-data";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assistant: router({
    ask: publicProcedure.input(z.object({ query: z.string().min(2), language: z.string().optional() })).query(({ input }) => ({
      ...answerWithFallback(input.query),
      language: input.language ?? "English",
    })),
  }),

  standards: router({
    recommend: publicProcedure.input(z.object({ product: z.string().min(1), description: z.string().default("") })).query(({ input }) => recommendStandard(input.product, input.description)),
    products: publicProcedure.query(() => DEMO_PRODUCTS),
  }),

  scanner: router({
    demoAnalyze: publicProcedure.query(() => demoScanResult()),
  }),

  knowledge: router({
    status: publicProcedure.query(() => ({ documents: 124, standardsIndexed: 87, unknownQueries: 9, lastUpdated: "2026-09-28", sources: TRUSTED_SOURCES, entries: KNOWLEDGE_BASE.map(({ id, title, source, demoOnly }) => ({ id, title, source, demoOnly: Boolean(demoOnly) })) })),
    search: publicProcedure.input(z.object({ query: z.string().min(1) })).query(({ input }) => retrieveKnowledge(input.query).map(({ entry, score }) => ({ ...entry, score }))),
  }),

  reports: router({
    build: publicProcedure.input(z.object({ product: z.string(), scanId: z.string().optional() })).query(({ input }) => ({ reportId: input.scanId ?? "BS-0028", generatedAt: new Date().toISOString(), product: input.product, sections: ["Product information", "Extracted fields", "Applicable standards found", "Claims detected", "Potential issues", "Sources", "Disclaimer"], disclaimer: "BISmart AI provides guidance and does not replace official BIS certification or regulatory decisions." })),
  }),

});

export type AppRouter = typeof appRouter;
