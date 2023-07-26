using { com.bezolli.todolist as db } from '../db/todoList';

service CatalogService {
    entity Todo as projection on db.Todo;
    entity TodoList as projection on db.TodoList;
}