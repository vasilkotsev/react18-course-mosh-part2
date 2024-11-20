import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_TODOS } from "../constants";
import APIClient from "../services/apiClient";
import { Todo } from "./useTodos";

const apiClient = new APIClient<Todo>("/todos");

interface AddTodoContext {
  previousTodos: Todo[];
}

const useAddTodo = (onAdd?: (test: string) => void) => {
  const queryClient = useQueryClient(); //хук, достъпващ нашия queryClient, дефиниран в main.tsx]

  return useMutation<Todo, Error, Todo, AddTodoContext>({
    mutationFn: apiClient.post,

    // onMuтате se извиква преди изпълнението на mutationFn
    onMutate: (newTodo: Todo) => {
      /* достъпваме данните, преди да ъпдейтнем кеша, и на края на функция го връщаме като пропърти на обект /context/
      Този context се използва, когато заявката ни с новите данни пропадне, за да възстановим и покажем старите данни */
      const previousTodos =
        queryClient.getQueryData<Todo[]>(CACHE_KEY_TODOS) || [];

      /* Approach 1: Invalidating the cache=> казваме на RQuery, че каквото имаме в кеша 
      е невалидно и RQ ще re-fetch-не всичките данни от бекенда. Не работи с фейк API като jsonplaceholder*/
      // queryClient.invalidateQueries({
      //   queryKey: CACHE_KEY_TODOS,
      // });

      /* Approach 2: Updating the data in cache directly */
      queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos = []) => [
        newTodo,
        ...todos,
      ]);

      if (onAdd) onAdd("test");

      // връщаме данните /взети преди ъпдейта на кеша/ като пропърти на обект /context object/, за да ги достъпим в onError()
      return { previousTodos };
    },

    onSuccess: (savedTodo, newTodo) => {
      queryClient.setQueriesData<Todo[]>(CACHE_KEY_TODOS, (todos) =>
        todos?.map((todo) => (todo === newTodo ? savedTodo : todo))
      );
    },

    //context parameter e обект, който ни създаваме /в случай , за да подаваме data измежду нашите колбеци /onMutate. onSuccess, onError/
    onError: (error, newTodo, context) => {
      queryClient.setQueriesData<Todo[]>(
        CACHE_KEY_TODOS,
        context?.previousTodos
      );
    },
  });
};

export default useAddTodo;
