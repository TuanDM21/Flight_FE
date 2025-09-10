import { z } from 'zod'

export const envSchema = z.object({
  // base
  baseUrl: z.string(),
  dev: z.boolean(),
  mode: z.enum(['development', 'production', 'test', 'staging']),
  prod: z.boolean(),
  ssr: z.boolean(),

  // custom
  viteBaseApi: z.url({
    error: "VITE_BASE_API isn't a valid url",
  }),
})

export type EnvVariables = z.infer<typeof envSchema>

export const envVariables = {
  baseUrl: import.meta.env.BASE_URL,
  dev: import.meta.env.DEV,
  mode: import.meta.env.MODE as EnvVariables['mode'],
  prod: import.meta.env.PROD,
  ssr: import.meta.env.SSR,
  viteBaseApi: import.meta.env.VITE_BASE_API as EnvVariables['viteBaseApi'],
} satisfies EnvVariables

export const loadEnvVariables = () => {
  const parsed = envSchema.safeParse(envVariables)
  if (!parsed.success) {
    throw new Error('Invalid environment variables')
  }
  return parsed.data
}
