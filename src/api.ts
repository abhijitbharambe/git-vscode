import type { JournalEntry, Todo } from './models'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getMigrationStatus() {
  return request<{ imported: boolean }>('/api/migration/status')
}

export function importLegacyData(journalEntries: JournalEntry[], todos: Todo[]) {
  return request<{ imported: boolean }>('/api/migration/import', {
    method: 'POST',
    body: JSON.stringify({ journalEntries, todos }),
  })
}

export function getEntries() {
  return request<JournalEntry[]>('/api/journal')
}

export function createEntry(content: string) {
  return request<JournalEntry>('/api/journal', {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function getTodos() {
  return request<Todo[]>('/api/todos')
}

export function createTodo(text: string) {
  return request<Todo>('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export function setTodoDone(id: number, done: boolean) {
  return request<Todo>(`/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ done }),
  })
}

export function deleteTodo(id: number) {
  return request<void>(`/api/todos/${id}`, { method: 'DELETE' })
}