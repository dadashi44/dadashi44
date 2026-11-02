---
title: vue-llm: an AI SDK for Vue and Nuxt with streaming chat, Generative UI and in-browser models
description: An open-source library for building LLM features in Vue 3, Nuxt and Vue 2.7: streaming chat, tool calls rendered as Vue components, and models that run right in the browser on WebGPU.
---
If you've built an AI feature in Vue, you've probably hit the same wall: most ready-made tools for LLM interfaces are written with React in mind, so in Vue you either adapt them or write streaming, tool calling and chat state by hand. I built **vue-llm**, an open-source library that covers this for Vue 3, Nuxt and even Vue 2.7.

Links first, so you can try it out:

- **Playground, no API key needed** (the model downloads and runs right in your browser on WebGPU): [https://vue-llm.js.org/playground](https://vue-llm.js.org/playground)
- Docs: [https://vue-llm.js.org/](https://vue-llm.js.org/)
- GitHub: [https://github.com/dadashi44/vue-llm](https://github.com/dadashi44/vue-llm)
- npm: `npm i vue-llm`

Below is what the library can do and what it looks like in code.

## A chat in ten lines

The core is the `useChat` composable. It streams the model's response token by token into reactive state: messages, status, error, cancellation, regeneration.

```vue
<script setup lang="ts">
import { useChat } from 'vue-llm'
import { createProxyProvider } from 'vue-llm/server'

const { messages, input, handleSubmit, status, stop } = useChat({
  provider: createProxyProvider('/api/chat'),
  model: 'gpt-4o',
})
</script>

<template>
  <div v-for="m in messages" :key="m.id">
    <b>{{ m.role }}:</b>
    <template v-for="(part, i) in m.parts" :key="i">
      <span v-if="part.type === 'text'">{{ part.text }}</span>
    </template>
  </div>
  <form @submit.prevent="handleSubmit">
    <input v-model="input">
    <button v-if="status === 'streaming'" type="button" @click="stop">Stop</button>
  </form>
</template>
```

Messages are made of `parts`: text, model reasoning, tool calls, files, sources. So the same template renders a plain answer, reasoning from Claude or Qwen3, and a tool call.

The API key stays on the server. The server side is a plain Web-standard `Request → Response` handler that runs in Nuxt/Nitro, Node, Bun, Deno and edge runtimes:

```ts
// server/api/chat.post.ts (Nuxt)
import { createLLMHandler } from 'vue-llm/server'
import { createAnthropic } from 'vue-llm/providers'

const handler = createLLMHandler({
  provider: createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }),
  model: 'claude-sonnet-4-5',
  rateLimit: { maxRequests: 30, interval: 60_000 },
})

export default defineEventHandler(event => handler(toWebRequest(event)))
```

Providers out of the box: OpenAI (and any OpenAI-compatible API), Anthropic, Google Gemini, Ollama. If you already have your own streaming backend, `createSSEProvider` hooks `useChat` up to it: you describe how your SSE events map to response chunks, and everything else works as is.

## Generative UI: the model answers with components

This is the most interesting part for me. When the model calls a tool, you can show your own Vue component instead of text. Arguments stream into the component as they're generated, so the card starts filling in before the model has even finished writing the call.

```ts
import { defineTool } from 'vue-llm'

export const getWeather = defineTool<{ city: string }, Weather>({
  name: 'get_weather',
  description: 'Weather in a city',
  parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
  execute: ({ city }) => fetch(`/api/weather?city=${city}`).then(r => r.json()),
})
```

```vue
<MessageParts
  v-for="m in messages"
  :key="m.id"
  :message="m"
  :components="{ get_weather: WeatherCard }"
  @tool-result="addToolResult"
/>
```

A tool with `execute` runs on its own. A tool without `execute` pauses the chat and waits for an answer from the UI. That's how you do human-in-the-loop: the model offers to book a table, the user clicks "Confirm" in the card, `addToolResult` passes the answer back, and the conversation continues. Live demo (works offline): [https://vue-llm.js.org/guide/generative-ui](https://vue-llm.js.org/guide/generative-ui)

Under the hood this required writing a parser for "unfinished" JSON: `{"city":"Mos` becomes `{ city: 'Mos' }`, and incomplete keys are dropped until they're fully written.

## Models right in the browser

`createWebLLM` runs open models (Llama 3.2, Qwen, SmolLM, Phi) on WebGPU via WebLLM. No server, no key, and the data never leaves the device.

```ts
import { CreateMLCEngine } from '@mlc-ai/web-llm'
import { createWebLLM } from 'vue-llm/providers'

const ai = createWebLLM({
  createEngine: CreateMLCEngine,
  onProgress: ({ progress }) => console.log(`${Math.round(progress * 100)}%`),
})

useChat({ provider: ai, model: 'Llama-3.2-1B-Instruct-q4f16_1-MLC' })
```

It's the same `useChat` as with OpenAI, only the provider changes. For example, you can give users without WebGPU a server-side model and everyone else a local one. The first model download is 400 MB and up; after that it loads from the browser cache in a second or two.

## A ready-made shadcn-style chat UI

Writing a chat window from scratch is tedious: autoscroll that doesn't yank the user back down while they're scrolling up, Enter-to-send that doesn't fire while typing Chinese or Japanese with an IME, pasting images from the clipboard, drag-and-drop for files. So the library takes a hybrid approach:

- the headless logic ships in the npm package: `usePromptInput` and `useAutoScroll`;
- the ready-made components get copied into your project shadcn-style, with a single command, and from then on the code is yours:

```bash
npx shadcn-vue@latest add https://vue-llm.js.org/r/chat.json
```

The components use shadcn theme tokens, so they match the rest of your UI right away, dark mode included.

## Debugging in Vue DevTools

`vue-llm/devtools` adds an LLM tab to Vue DevTools: a list of all `useChat` instances, tokens, time to first token, generation speed, tool calls and a timeline for every request. Without the plugin the library doesn't trace anything and spends no resources on it.

## Nuxt

The module is added with one command:

```bash
npx nuxi module add vue-llm
```

It auto-imports the composables and providers, registers the components, and in dev mode wires up the DevTools tab for you. Tested on Nuxt 3 and 4.

## Why not just use an existing AI SDK

Good question, and it's where I started too. vue-llm is Vue-first: a Nuxt module, Vue components for Generative UI, Vue DevTools integration, a provider for in-browser models, an adapter for an existing SSE backend, and Vue 2.7 support for the composables (plenty of legacy admin panels are still on Vue 2). There are no runtime dependencies other than Vue itself.

## What's next

The library is MIT-licensed, at version 1.3, and covered by tests on Vue 3 and Vue 2.7. On the roadmap: an MCP client (plugging MCP servers in as tools), answers with citations for RAG, and voice input.

I'd love your feedback: what's awkward, what's missing, where the docs are unclear. Issues and PRs are welcome, and if the project is useful to you, give it a star on GitHub. It really does help get the word out.

- Playground: [https://vue-llm.js.org/playground](https://vue-llm.js.org/playground)
- Docs: [https://vue-llm.js.org/](https://vue-llm.js.org/)
- GitHub: [https://github.com/dadashi44/vue-llm](https://github.com/dadashi44/vue-llm)
