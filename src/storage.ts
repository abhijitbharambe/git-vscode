import Dexie, { type Table } from 'dexie'
import type { JournalEntry, Todo } from './models'

type MigrationRecord = { key: string; value: boolean }

const migrationKey = 'localStorage-v1'

class LegacyDatabase extends Dexie {
  journalEntries!: Table<JournalEntry, number>
  todos!: Table<Todo, number>
  metadata!: Table<MigrationRecord, string>

  constructor() {
    super('daymark')
    this.version(1).stores({
      journalEntries: 'id, createdAt',
      todos: 'id, done',
      metadata: '&key',
    })
  }
}

export const db = new LegacyDatabase()

function readLegacyRecords<T>(key: string): T[] {
  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) return []
    const records: unknown = JSON.parse(stored)
    return Array.isArray(records) ? records as T[] : []
  } catch {
    return []
  }
}

export async function initializeDatabase() {
  if (await db.metadata.get(migrationKey)) return

  const legacyEntries = readLegacyRecords<JournalEntry>('daymark.entries')
  const legacyTodos = readLegacyRecords<Todo>('daymark.todos')

  await db.transaction('rw', db.journalEntries, db.todos, db.metadata, async () => {
    if (await db.metadata.get(migrationKey)) return
    if (legacyEntries.length && await db.journalEntries.count() === 0) {
      await db.journalEntries.bulkPut(legacyEntries)
    }
    if (legacyTodos.length && await db.todos.count() === 0) {
      await db.todos.bulkPut(legacyTodos)
    }
    await db.metadata.put({ key: migrationKey, value: true })
  })
}