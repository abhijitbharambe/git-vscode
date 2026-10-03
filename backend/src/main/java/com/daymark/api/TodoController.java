package com.daymark.api;

import com.daymark.api.ApiModels.CreateTodo;
import com.daymark.api.ApiModels.UpdateTodoStatus;
import com.daymark.model.Todo;
import com.daymark.repository.TodoRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/todos")
public class TodoController {
    private final TodoRepository todos;

    public TodoController(TodoRepository todos) {
        this.todos = todos;
    }

    @GetMapping
    public List<Todo> listTodos() {
        return todos.findAllByOrderByIdAsc();
    }

    @PostMapping
    public Todo createTodo(@Valid @RequestBody CreateTodo request) {
        return todos.save(new Todo(request.text().trim(), false));
    }

    @PatchMapping("/{id}")
    public Todo updateTodo(@PathVariable long id, @RequestBody UpdateTodoStatus request) {
        Todo todo = todos.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        todo.setDone(request.done());
        return todos.save(todo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTodo(@PathVariable long id) {
        todos.deleteById(id);
    }
}