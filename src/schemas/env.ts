import { z } from 'zod'

export const envSchema = z.object({
  baseUrl: z.string(),
  dev: z.boolean(),
  mode: z.enum(['development', 'production', 'test', 'staging']),
  prod: z.boolean(),
  ssr: z.boolean(),

  // custom
  viteBaseApi: z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain,
    message: 'VITE_BASE_API must be a valid URL',
  }),
})
