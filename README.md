# React Suspense Mode

[Based on this article](https://reactjs.org/docs/concurrent-mode-suspense.html)
we decided to make an experimental project to learn how this will work.

We're calling this project "Hunds und Katzen" because we'll be seeing a
lot of hunds und katzen.

![Have a cat](https://api.thecatapi.com/v1/images/search?format=src)

## En Example of Suspense
(taken directly from our React slack channel)

Currently, you're either "fetching on render" or you're 
"fetching-then-rendering" where the latter is only possible with 
[Relay](https://github.com/facebook/relay).

So the traditional approach is:

```js
const Component = () => {
  useEffect(() => {
    fetchSomething().then(r => setData(r))
  }, [data, setData])
}
```

Whereas with Suspense, you can do:

```js
// This is a function that initializes the fetch of a large data set
// What you want to do, is start fetch as early as possible, fetching-as-you-render
const resource = fetchPosts()
const SuspensefulPostList = () => {
  <Suspense fallback={<p>Loading...</p>}>
    <PostList />
  </Suspense>
}
const PostList = () => {
  // We attempt to read data that might still be loading
  const posts = resource.read()
  return posts.map(({title, author, body}) => (
    <>
      <h4>{title}</h4>
      <small>By: {author}</small>
      <p>{body}</p>
    </>
  )
}
const Posts = () => <SuspensefulPostList />
```

You can take this a step further, say if you know the post IDs that you 
want to display on the page:

```js
const postIdsOnPage = [1, 2, 3]
const resource = fetchPostsForPage(postIdsOnPage)
const SuspensefulPost = ({ postId }) => (
  <Suspense fallback={<p>...Loading</p>}>
    <Post postIdIndex={postIdsOnPage.indexOf(postId)} />
  <Suspense>
)
const Post = ({ postIdIndex }) => {
  const { title, author, body } = resource[postIdIndex].read()
  return (
    <>
      <h4>{title}</h4>
      <small>By: {author}</small>
      <p>{body}</p>
    </>
  )
}
const PostList = () => (
  <SuspenseList revealOrder={forward}>
    {postIdsOnPage.map(postId => <SuspensefulPost postId={postId} />)}
  </SuspenseList>
)
```

Here, instead of fetching the entire post list, we fetch posts 
one-by-one. Assuming that we're hitting an API where we have something 
like `/posts/{postId}`

We're doing a series of API requests (small requests versus one giant 
one), but this can be useful in that you can display posts as they are 
loaded from the API.

However, in order to do this.. first you need to be using concurrent 
mode. You also want to control in the way you display the data as it's 
loaded. Since we're doing a series of API calls, each one can arrive at 
various intervals. So for a good UX, we want to control the way they are
revealed to the user. We use a special React component called 
`<SuspenseList>` where we set the reveal order.

There's some magic that you need to make happen behind the scene though.
This function fetchPostsForPage is responsible for doing the fetch 
requests for your data. In a nutshell, this is what it does in 
pseudo-code:

    Start the fetch and create a promise object
    Create a suspender object that returns the result of the promise (promise.then(...))
    Return a function called 'read' where
      If the promise is pending, return the suspender
      If the promise returns and error, throw the error
      If the promise is successful, return the result

For a series, simply do the same thing, but with an array of promises.