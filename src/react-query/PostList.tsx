import React from "react";
import usePosts from "./hooks/usePost";

const PostList = () => {
  const pageSize = 10; //Number of results to return per page.

  const {
    data: posts,
    error,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = usePosts({ pageSize });

  if (isLoading) return <p>Loading... </p>;

  if (error) return <p>{error.message}</p>;

  console.log("render PostList Component");

  return (
    <>
      <ul className="list-group">
        {posts.pages.map((page, index) => (
          <React.Fragment key={index}>
            {page.map((post) => (
              <li key={post.id} className="list-group-item">
                {post.title}
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>

      <button
        disabled={isFetchingNextPage}
        className="btn btn-primary my-3 ms-3"
        onClick={() => fetchNextPage()}
      >
        {isFetchingNextPage ? "Loading" : "Load More"}
      </button>
    </>
  );
};

export default PostList;
