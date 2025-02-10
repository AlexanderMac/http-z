export type HttpZHeader = {
  name: string
  value: string
}

export type HttpZParam = {
  name: string
  value?: string
}

export type HttpZBody = {
  text?: string
  params?: HttpZBodyParam[]
  contentType?: string
  boundary?: string
}

export type HttpZBodyParam = {
  name?: string
  value?: string
  type?: string
  fileName?: string
  contentType?: string
}

export type HttpZCookieParam = {
  name: string
  value?: string
  params?: string[]
}
