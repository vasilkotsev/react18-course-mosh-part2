import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import { Todo } from "./hooks/useTodos";

const TodoForm = () => {
  const queryClient = useQueryClient(); //хук, достъпващ нашия queryClient, дефиниран в main.tsx]

  const addTodo = useMutation({
    mutationFn: (todo: Todo) =>
      axios
        .post<Todo>("https://jsonplaceholder.typicode.com/todos", todo)
        .then((res) => res.data),
    onSuccess: (savedTodo, newTodo) => {
      /* Approach 1: Invalidating the cache=> казваме на RQuery, че каквото имаме в кеша 
      е невалидно и RQ ще re-fetch-не всичките данни от бекенда. Не работи с фейк API като jsonplaceholder*/
      // queryClient.invalidateQueries({
      //   queryKey: ["todos"],
      // });

      /* Approach 2: Updating the data in cache directly */
      queryClient.setQueryData<Todo[]>(["todos"], (todos = []) => [
        savedTodo,
        ...todos,
      ]);
    },
  });

  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      className="row mb-3"
      onSubmit={(e) => {
        e.preventDefault();

        if (ref.current?.value) {
          addTodo.mutate({
            id: 0,
            title: ref.current?.value,
            completed: false,
            userId: 1,
          });
        }
      }}
    >
      <div className="col">
        <input ref={ref} type="text" className="form-control" />
      </div>
      <div className="col">
        <button className="btn btn-primary">Add</button>
      </div>
    </form>
  );
};

export default TodoForm;
