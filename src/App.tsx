import React, { useReducer } from 'react'

const App: React.FC = () => {
  return (
    <div>
      <TodoList task="Ma Liste de Tâches" /> {/* Passer la propriété task ici */}
    </div>
  );
};

// Interface pour représenter une tâche
interface Todo {
  id: number;
  text: string;
  completed: boolean; // État pour savoir si la tâche est terminée
}

// Interface pour l'état du composant
interface State {
  draft: string; // Texte de la tâche en cours de rédaction
  todos: Todo[]; // Liste des tâches
}

// Interface pour les actions du reducer
interface Action {
  type: string; // Type de l'action (ajout, suppression, etc.)
  nextDraft?: string; // Texte de la tâche
  id?: number; // ID de la tâche
}


// Fonction pour créer l'état initial
function createInitialState(): State {
  return {
    draft: '',
    // Charger les tâches depuis le Local Storage ou un tableau vide par défaut
    todos: JSON.parse(localStorage.getItem('todos') || '[]'),
  };
}

// Reducer pour gérer les actions sur l'état
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'changed_draft': {
      return {
        ...state,
        draft: action.nextDraft || '', // Met à jour le texte de la tâche
      };
    }
    case 'added_todo': {
      const newTodo = {
        id: Date.now(), // Utilise le timestamp comme ID unique
        text: state.draft,
        completed: false, // Nouvelle tâche non terminée par défaut
      };
      const updatedTodos = [newTodo, ...state.todos]; // Ajoute la nouvelle tâche à la liste
      // Met à jour le Local Storage avec la nouvelle liste de tâches
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return {
        draft: '', // Réinitialise le champ de saisie
        todos: updatedTodos, // Retourne la nouvelle liste de tâches
      };
    }
    case 'removed_todo': {
      if (action.id === undefined) return state; // Vérifie si l'ID est fourni
      const updatedTodos = state.todos.filter(todo => todo.id !== action.id); // Filtre la tâche à supprimer
      // Met à jour le Local Storage avec la liste de tâches mise à jour
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return {
        ...state,
        todos: updatedTodos, // Retourne la nouvelle liste de tâches
      };
    }
    case 'toggle_todo': {
      if (action.id === undefined) return state; // Vérifie si l'ID est fourni
      const updatedTodos = state.todos.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo // Inverse l'état de complétion
      );
      // Met à jour le Local Storage avec la liste de tâches mise à jour
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return {
        ...state,
       todos: updatedTodos, // Retourne la nouvelle liste de tâches
      };
    }
    case 'edit_todo': {
      if (action.id === undefined || action.nextDraft === undefined) return state; // Vérifie les valeurs fournies
      const updatedTodos = state.todos.map(todo =>
        todo.id === action.id ? { ...todo, text: action.nextDraft } : todo // Met à jour le texte de la tâche
      );
      // Met à jour le Local Storage avec la liste de tâches mise à jour
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      return {
        ...state,
        todos: JSON.parse(localStorage.getItem('todos') || '[]'), // Charger les tâches depuis le Local Storage
      };
    }
    default:
      throw new Error(`Unknown action: ${action.type}`); // Gère les actions inconnues
  }
}

// Props pour le composant TodoList
interface TodoListProps {
  task: string; // Titre de la liste de tâches
}

// Composant principal de la Todo List
const TodoList: React.FC<TodoListProps> = ({ task }) => {
  const [state, dispatch] = useReducer(reducer, createInitialState()); // Initialise le reducer

  // Fonction pour gérer l'édition d'une tâche
  const handleEdit = (item: Todo) => {
    dispatch({ type: 'changed_draft', nextDraft: item.text }); // Préremplit le champ de saisie
    dispatch({ type: 'removed_todo', id: item.id }); // Supprime temporairement pour éviter les doublons
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{task} My Todo List</h1>
      <input
        className="border border-gray-300 p-2 rounded w-full mb-2"
        value={state.draft} // Affiche le texte en cours de saisie
        onChange={e => {
          dispatch({
            type: 'changed_draft',
            nextDraft: e.target.value, // Met à jour le texte de la tâche
          });
        }}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded w-full"
        onClick={() => {
          if (state.draft.trim()) {
            dispatch({ type: 'added_todo' }); // Ajoute la tâche si le champ n'est pas vide
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
                checked={item.completed} // Vérifie si la tâche est terminée
                onChange={() => {
                  dispatch({ type: 'toggle_todo', id: item.id }); // Change l'état de complétion
                }}
                className="mr-2"
              />
              <span className={item.completed ? 'line-through text-gray-500' : ''}>
                {item.text}
              </span>
            </label>
            <div>
              <button
                className="bg-yellow-500 text-white p-1 rounded mr-2"
                onClick={() => handleEdit(item)} // Gère l'édition de la tâche
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white p-1 rounded"
                onClick={() => {
                  dispatch({ type: 'removed_todo', id: item.id }); // Supprime la tâche
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;