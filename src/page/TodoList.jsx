import { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    // Fetch todos from API or local storage
    const getTodos = async () => {
      try {
        const response = await fetch("http://localhost:8080/todos");
        const data = await response.json();

        if (data.status === "success") {
          setTodos(data.data);
        }
      } catch (err) {
        console.error(`發生錯誤為:${err.message},取得todos失敗!`);
      }
    };
    getTodos();
  }, []);

  const addTodo = async () => {
    if (inputValue.trim() === "") return;

    const response = await fetch("http://Localhost:8080/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: inputValue,
      }),
    });
    const result = await response.json();

    setTodos(result.data);
    setInputValue("");
  };

  const toggleTodo = async (id) => {
    const targetTodo = todos.find((todo) => todo.id === id);
    if (!targetTodo) return;

    const response = await fetch(`http://localhost:8080/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !targetTodo.completed,
      }),
    });
    const data = await response.json();

    if (data.status === "success") {
      setTodos(data.data);
    }
  };

  const patchTodo = async (id) => {
    if (editingValue.trim() === "") return;
    const response = await fetch(`http://localhost:8080/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editingValue,
      }),
    });
    const data = await response.json();
    if (data.status === "success") {
      setTodos(data.data);
      setEditingId(null);
      setEditingValue("");
    }
  };

  const deleteTodo = async (id) => {
    const response = await fetch(`http://localhost:8080/todos/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.status === "success") {
      setTodos(data.data);
    }
  };

  const clearAll = async () => {
    const response = await fetch("http://localhost:8080/todos", {
      method: "DELETE",
    });
    const result = await response.json();
    setTodos(result.data);
  };

  const unCompletedCount = todos.filter((todo) => !todo.completed).length;

  return (
    <>
      <div className="todoContainer">
        <div className="todoBgc">
          <h1 className="title">TODO LIST</h1>
          <div className="todoInputContainer">
            <input
              type="text"
              className="todoInputArea"
              placeholder="請輸入待辦事項..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="button" className="todoAddBtn" onClick={addTodo}>
              <Plus />
            </button>
          </div>
        </div>

        <div className="todoListContent">
          <ul className="todoList">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="todoItem group"
                onClick={() => toggleTodo(todo.id)}
              >
                <button
                  type="button"
                  className={
                    todo.completed ? "checkBtn checkedBtn" : "checkBtn"
                  }
                >
                  {todo.completed ? (
                    <Check className="checkIcon" />
                  ) : (
                    <Check className="checkIcon unchecked" />
                  )}
                </button>
                {editingId === todo.id ? (
                  <>
                    <input
                      className="editInput"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <button
                      type="button"
                      className="decideBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        patchTodo(todo.id);
                      }}
                    >
                      完成
                    </button>

                    <button
                      type="button"
                      className="cancelBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                        setEditingValue("");
                      }}
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <span
                    className={
                      todo.completed
                        ? "todoText line-through text-gray-400"
                        : "todoText"
                    }
                  >
                    {todo.title}
                  </span>
                )}

                {editingId !== todo.id && !todo.completed && (
                  <button
                    className="patchBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(todo.id);
                      setEditingValue(todo.title);
                    }}
                  >
                    編輯
                  </button>
                )}
                {editingId !== todo.id && (
                  <button
                    className="deleteBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTodo(todo.id);
                    }}
                  >
                    刪除
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="todoFooter">
            <p className="todoCount">{unCompletedCount} 個待完成項目</p>

            <button type="button" className="clearBtn" onClick={clearAll}>
              清除所有項目
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TodoList;
