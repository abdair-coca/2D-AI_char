import type { IncomingMessage } from "node:http"

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

import decideHandler from './api/decide.js'

async function readRequestBody(request: IncomingMessage) {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk))
  }

  return Buffer.concat(chunks).toString('utf8')
}

function decideApiPlugin(): Plugin {
  return {
    name: 'dev-decide-api',
    configureServer(server) {
      server.middlewares.use('/api/decide', async (request, response, next) => {
        try {
          let responded = false
          const apiResponse = {
            status(statusCode: number) {
              response.statusCode = statusCode
              return apiResponse
            },
            json(body: unknown) {
              response.setHeader('Content-Type', 'application/json')
              response.end(JSON.stringify(body))
              responded = true
              return apiResponse
            },
          }

          await decideHandler({
            method: request.method,
            body: await readRequestBody(request),
          }, apiResponse)

          if (!responded && !response.writableEnded) {
            next()
          }
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (env.TYPESAFE_API_KEY) {
    process.env.TYPESAFE_API_KEY = env.TYPESAFE_API_KEY
  }

  return {
    plugins: [react(), decideApiPlugin()],
  }
})
