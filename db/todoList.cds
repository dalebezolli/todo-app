namespace com.bezolli.todolist;

entity Todo {
    key ID: Integer;
    text: String(100);
    completed: Boolean;
    list: Association to TodoList;
}

entity TodoList {
    key ID: Integer;
    name: String(80);
    children: Association to many Todo on children.list = $self;
}