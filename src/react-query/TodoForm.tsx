import { useRef } from "react";
import useAddTodo from "./hooks/useAddTodo";

const TodoForm = () => {
  const ref = useRef<HTMLInputElement>(null);

  const { mutate, error } = useAddTodo((test: string) => {
    if (ref.current) ref.current.value = "";
    console.log(test);
  });

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
          <button className="btn btn-primary">Add</button>
        </div>
      </form>
    </>
  );
};

export default TodoForm;
