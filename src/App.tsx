import React, { useReducer } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean; // État pour savoir si la tâche est terminée
}

interface State {
  draft: string;
  todos: Todo[];
}

interface Action {
  type: string;
  nextDraft?: string;
  id?: number; // ID de la tâche
}

function createInitialState(): State {
  return {
    draft: '',
    todos: [],
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'changed_draft': {
      return {
        ...state,
        draft: action.nextDraft || '',
      };
    }
    case 'added_todo': {
      return {
        draft: '',
        todos: [{
          id: state.todos.length,
          text: state.draft,
          completed: false, // Nouvelle tâche non terminée par défaut
        }, ...state.todos],
      };
    }
    case 'removed_todo': {
      if (action.id === undefined) return state;
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.id),
      };
    }
    case 'toggle_todo': { // Action pour marquer une tâche comme terminée
      if (action.id === undefined) return state;
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
        ),
      };
    }
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

interface TodoListProps {
  username: string;
}

const TodoList: React.FC<TodoListProps> = ({ username }) => {
  const [state, dispatch] = useReducer(reducer, createInitialState());

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{username}My Todo List</h1>
      <input
        className="border border-gray-300 p-2 rounded w-full mb-2"
        value={state.draft}
        onChange={e => {
          dispatch({
            type: 'changed_draft',
            nextDraft: e.target.value,
          });
        }}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded w-full"
        onClick={() => {
          if (state.draft.trim()) {
            dispatch({ type: 'added_todo' });
          }
        }}
      >
        Add
      </button>
      <ul className="mt-4">
        {state.todos.map(item => (
          <li key={item.id} className="flex justify-between items-center border-b py-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => {
                  dispatch({ type: 'toggle_todo', id: item.id });
                }}
                className="mr-2"
              />
              <span className={item.completed ? 'line-through text-gray-500' : ''}>
                {item.text}
              </span>
            </label>
            <button
              className="bg-red-500 text-white p-1 rounded"
              onClick={() => {
                dispatch({ type: 'removed_todo', id: item.id });
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;