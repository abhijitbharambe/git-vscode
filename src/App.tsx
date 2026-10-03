import { useEffect, useState, type FormEvent } from 'react'
import { BookOpen, Check, CheckSquare, Circle, Plus, Trash2 } from 'lucide-react'
import { createEntry, createTodo, deleteTodo as deleteTodoRequest, getEntries, getMigrationStatus, getTodos, importLegacyData, setTodoDone } from './api'
import { initializeDatabase, db } from './storage'
import type { JournalEntry, Todo } from './models'

type Section = 'journal' | 'todos'
type TodoFilter = 'all' | 'active' | 'completed'

function App() {
  const [section, setSection] = useState<Section>('journal')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [entryDraft, setEntryDraft] = useState('')
  const [todoDraft, setTodoDraft] = useState('')
  const [filter, setFilter] = useState<TodoFilter>('all')
  const [storageReady, setStorageReady] = useState(false)
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDatabase() {
      try {
        const migrationStatus = await getMigrationStatus()
        if (!migrationStatus.imported) {
          await initializeDatabase()
          const [legacyEntries, legacyTodos] = await Promise.all([
            db.journalEntries.toArray(),
            db.todos.toArray(),
          ])
          await importLegacyData(legacyEntries, legacyTodos)
        }
        const [savedEntries, savedTodos] = await Promise.all([getEntries(), getTodos()])
        if (active) {
          setEntries(savedEntries)
          setTodos(savedTodos)
        }
      } catch {
        if (active) setStorageError('The local H2 database is unavailable. Start the backend and reload.')
      } finally {
        if (active) setStorageReady(true)
      }
    }

    void loadDatabase()
    return () => { active = false }
  }, [])

  function reportStorageError() {
    setStorageError('Your changes could not be saved to the local H2 database. Please try again.')
  }

  const completedCount = todos.filter((todo) => todo.done).length
  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.done
    if (filter === 'completed') return todo.done
    return true
  })

  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = entryDraft.trim()
    if (!content || !storageReady || storageError) return
    try {
      const entry = await createEntry(content)
      setEntries((current) => [entry, ...current])
      setEntryDraft('')
    } catch {
      reportStorageError()
    }
  }

  async function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = todoDraft.trim()
    if (!text || !storageReady || storageError) return
    try {
      const todo = await createTodo(text)
      setTodos((current) => [...current, todo])
      setTodoDraft('')
    } catch {
      reportStorageError()
    }
  }

  async function toggleTodo(todo: Todo) {
    try {
      const updatedTodo = await setTodoDone(todo.id, !todo.done)
      setTodos((current) => current.map((item) => item.id === todo.id ? updatedTodo : item))
    } catch {
      reportStorageError()
    }
  }

  async function removeTodo(todoId: number) {
    try {
      await deleteTodoRequest(todoId)
      setTodos((current) => current.filter((item) => item.id !== todoId))
    } catch {
      reportStorageError()
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="wordmark" href="#journal" onClick={() => setSection('journal')}>
          <span className="wordmark-mark">d.</span>
          <span>daymark</span>
        </a>
        <div className="nav-label">YOUR SPACE</div>
        <nav aria-label="Main navigation" className="main-nav">
          <button
            className={`nav-item ${section === 'journal' ? 'is-active' : ''}`}
            onClick={() => setSection('journal')}
            aria-current={section === 'journal' ? 'page' : undefined}
          >
            <BookOpen size={18} strokeWidth={1.8} />
            <span>Journal</span>
            {section === 'journal' && <span className="nav-indicator" />}
          </button>
          <button
            className={`nav-item ${section === 'todos' ? 'is-active' : ''}`}
            onClick={() => setSection('todos')}
            aria-current={section === 'todos' ? 'page' : undefined}
          >
            <CheckSquare size={18} strokeWidth={1.8} />
            <span>To-do list</span>
            <span className="nav-count">{todos.filter((todo) => !todo.done).length}</span>
            {section === 'todos' && <span className="nav-indicator" />}
          </button>
        </nav>
        <div className="sidebar-note">
          <span className="sidebar-note-rule" />
          <p>Make room for<br />what matters.</p>
        </div>
        <div className="sidebar-footer">A LITTLE SPACE, JUST FOR YOU</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>YOUR SPACE</span><span className="breadcrumb-slash">/</span><strong>{section === 'journal' ? 'JOURNAL' : 'TO-DO LIST'}</strong></div>
          <div className="today-pill"><span className="today-dot" />{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</div>
        </header>
        <div className="storage-status" role={storageError ? 'alert' : 'status'}>
          {storageError || (!storageReady ? 'Opening your local journal...' : '')}
        </div>

        {section === 'journal' ? (
          <section className="page-section journal-section" aria-labelledby="page-title">
            <div className="page-heading">
              <div className="eyebrow">A MOMENT TO CHECK IN</div>
              <h1 id="page-title">Your journal<span className="heading-period">.</span></h1>
              <p className="page-subtitle">A place to leave a thought, just as it is.</p>
            </div>

            <div className="journal-layout">
              <form className="entry-composer" onSubmit={saveEntry}>
                <div className="composer-topline">
                  <div className="prompt-mark">01</div>
                  <div>
                    <div className="composer-label">TODAY'S PAGE</div>
                    <div className="composer-date">{new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}</div>
                  </div>
                  <span className="composer-sparkle" aria-hidden="true">✳</span>
                </div>
                <label className="sr-only" htmlFor="journal-entry">Write a journal entry</label>
                <textarea
                  id="journal-entry"
                  value={entryDraft}
                  onChange={(event) => setEntryDraft(event.target.value)}
                  placeholder="What's on your mind?"
                  rows={7}
                />
                <div className="composer-bottomline">
                  <span className="soft-hint">No need to make it perfect.</span>
                  <button className="primary-button" type="submit" disabled={!entryDraft.trim() || !storageReady || Boolean(storageError)}>
                    Save entry <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </form>

              <aside className="journal-aside">
                <div className="aside-heading"><span>ENTRY HISTORY</span><span className="aside-count">{String(entries.length).padStart(2, '0')}</span></div>
                {entries.length === 0 ? (
                  <div className="empty-journal">
                    <span className="empty-mark">✳</span>
                    <p>Your pages will gather here.</p>
                    <span>Start with whatever's on your mind.</span>
                  </div>
                ) : (
                  <div className="entry-list" aria-label="Previous journal entries">
                    {entries.map((entry) => (
                      <article className="entry-preview" key={entry.id}>
                        <time>{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(entry.createdAt))}</time>
                        <p>{entry.content}</p>
                      </article>
                    ))}
                  </div>
                )}
                <div className="aside-bottom-rule" />
              </aside>
            </div>
          </section>
        ) : (
          <section className="page-section todo-section" aria-labelledby="page-title">
            <div className="page-heading">
              <div className="eyebrow">ONE THING AT A TIME</div>
              <h1 id="page-title">Your to-dos<span className="heading-period">.</span></h1>
              <p className="page-subtitle">A little clarity for what's next.</p>
            </div>

            <div className="todo-board">
              <div className="todo-summary">
                <div className="summary-number">{String(todos.length - completedCount).padStart(2, '0')}</div>
                <div><strong>still in motion</strong><span>{completedCount} of {todos.length} complete</span></div>
                <div className="progress-track" aria-label={`${todos.length ? Math.round((completedCount / todos.length) * 100) : 0}% complete`}>
                  <span style={{ width: `${todos.length ? (completedCount / todos.length) * 100 : 0}%` }} />
                </div>
              </div>

              <form className="todo-composer" onSubmit={addTodo}>
                <label className="sr-only" htmlFor="new-todo">Add a to-do</label>
                <Plus size={19} aria-hidden="true" />
                <input id="new-todo" value={todoDraft} onChange={(event) => setTodoDraft(event.target.value)} placeholder="Add something to your list..." />
                <button className="add-button" type="submit" disabled={!todoDraft.trim() || !storageReady || Boolean(storageError)} aria-label="Add to-do" title="Add to-do"><Plus size={18} /></button>
              </form>

              <div className="todo-list-header">
                <span>YOUR LIST <span className="list-count">{String(todos.length).padStart(2, '0')}</span></span>
                <div className="filter-tabs" role="group" aria-label="Filter to-dos">
                  {(['all', 'active', 'completed'] as const).map((option) => (
                    <button key={option} type="button" className={filter === option ? 'filter-active' : ''} aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</button>
                  ))}
                </div>
              </div>

              {visibleTodos.length === 0 ? (
                <div className="empty-todos">
                  <Circle size={23} strokeWidth={1.4} />
                  <p>{todos.length === 0 ? 'Your list is clear.' : `No ${filter} to-dos.`}</p>
                  <span>{todos.length === 0 ? 'Add one small thing to get started.' : 'Try another view or add something new.'}</span>
                </div>
              ) : (
                <ul className="todo-list">
                  {visibleTodos.map((todo) => (
                    <li className={`todo-row ${todo.done ? 'todo-done' : ''}`} key={todo.id}>
                      <button className="todo-check" onClick={() => void toggleTodo(todo)} aria-label={todo.done ? `Mark ${todo.text} incomplete` : `Complete ${todo.text}`}>
                        {todo.done && <Check size={13} strokeWidth={2.4} />}
                      </button>
                      <span className="todo-text">{todo.text}</span>
                      <button className="delete-button" onClick={() => void removeTodo(todo.id)} aria-label={`Delete ${todo.text}`} title="Delete to-do"><Trash2 size={16} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
        <footer className="page-footer"><span>DAYMARK</span><span>MAKE TODAY YOURS</span></footer>
      </main>
    </div>
  )
}

export default App