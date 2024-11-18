import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import { Todo } from "./hooks/useTodos";

interface AddTodoContext {
  previousTodos: Todo[];
}

const TodoForm = () => {
  const queryClient = useQueryClient(); //хук, достъпващ нашия queryClient, дефиниран в main.tsx]

  const { mutate, error, isLoading } = useMutation<
    Todo,
    Error,
    Todo,
    AddTodoContext
  >({
    mutationFn: (todo: Todo) =>
      axios
        .post("https://jsonplaceholder.typicode.com/todos", todo)
        .then((res) => res.data),

    // onMuтате se извиква преди изпълнението на mutationFn
    onMutate: (newTodo: Todo) => {
      /* достъпваме данните, преди да ъпдейтнем кеша, и на края на функция го връщаме като пропърти на обект /context/
      Този context се използва, когато заявката ни с новите данни пропадне, за да възстановим и покажем старите данни */
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]) || [];

      /* Approach 1: Invalidating the cache=> казваме на RQuery, че каквото имаме в кеша 
      е невалидно и RQ ще re-fetch-не всичките данни от бекенда. Не работи с фейк API като jsonplaceholder*/
      // queryClient.invalidateQueries({
      //   queryKey: ["todos"],
      // });

      /* Approach 2: Updating the data in cache directly */
      queryClient.setQueryData<Todo[]>(["todos"], (todos = []) => [
        newTodo,
        ...todos,
      ]);

      if (ref.current) ref.current.value = "";
      // връщаме данните /взети преди ъпдейта на кеша/ като пропърти на обект /context object/, за да ги достъпим в onError()
      return { previousTodos };
    },

    onSuccess: (savedTodo, newTodo) => {
      queryClient.setQueriesData<Todo[]>(["todos"], (todos) =>
        todos?.map((todo) => (todo === newTodo ? savedTodo : todo))
      );
    },

    //context parameter e обект, който ни създаваме /в случай , за да подаваме data измежду нашите колбеци /onMutate. onSuccess, onError/
    onError: (error, newTodo, context) => {
      queryClient.setQueriesData<Todo[]>(["todos"], context?.previousTodos);
    },
  });

  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      {error && <div className="alert alert-danger">{error.message}</div>}
      <form
        className="row mb-3"
        onSubmit={(e) => {
          e.preventDefault();

          if (ref.current?.value)
            mutate({
              id: 0,
              title: ref.current?.value,
              completed: false,
              userId: 1,
            });
        }}
      >
        <div className="col">
          <input ref={ref} type="text" className="form-control" />
        </div>
        <div className="col">
          <button disabled={isLoading} className="btn btn-primary">
            {isLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </>
  );
};

export default TodoForm;
