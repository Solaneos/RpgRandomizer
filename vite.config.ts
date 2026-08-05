import { Buffer } from 'node:buffer'
import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import geminiHandler from './api/gemini'
import historyHandler from './api/history'

function localApiHandlers(): Plugin {
  return {
    name: 'local-api-handlers',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split('?', 1)[0]
        const handler = pathname === '/api/gemini'
          ? geminiHandler
          : pathname === '/api/history'
            ? historyHandler
            : null
        if (!handler) {
          next()
          return
        }

        try {
          const headers = new Headers()
          for (const [name, value] of Object.entries(request.headers)) {
            if (Array.isArray(value)) {
              value.forEach((item) => headers.append(name, item))
            } else if (value !== undefined) {
              headers.set(name, value)
            }
          }

          const chunks: Buffer[] = []
          for await (const chunk of request) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }
          const requestBody = Buffer.concat(chunks).toString('utf8')
          const method = request.method ?? 'GET'
          const host = request.headers.host ?? 'localhost:5173'
          const webRequest = new Request(`http://${host}${request.url ?? '/api/gemini'}`, {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' || !requestBody ? undefined : requestBody,
          })

          const webResponse = await handler.fetch(webRequest)
          response.statusCode = webResponse.status
          webResponse.headers.forEach((value, name) => response.setHeader(name, value))
          response.end(Buffer.from(await webResponse.arrayBuffer()))
        } catch (error: unknown) {
          server.config.logger.error(
            `Erro ao executar a API local: ${error instanceof Error ? error.message : String(error)}`,
          )
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'Não foi possível executar a API local do Gemini.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const localEnvironment = loadEnv(mode, process.cwd(), '')
  for (const [name, value] of Object.entries(localEnvironment)) {
    if (process.env[name] === undefined) {
      process.env[name] = value
    }
  }

  return {
    plugins: [react(), localApiHandlers()],
  }
})
