importScripts('js/sw-toolbox.js')
importScripts('js/scope.js')

/******************************************************
  install event
*******************************************************/
toolbox.precache([
  'https://fonts.googleapis.com/css?family=Roboto:regular,bold,italic,thin,light,bolditalic,black,medium&amp;lang=en',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  '/sw-renderer/css/material.min.css',
  '/sw-renderer/css/main.css'
])




const {router} = toolbox

function fetchAndStore(req) {
  return toolbox.fastest(new Request(req))
}

/******************************************************
  Routing
*******************************************************/

// Home page
router.get('/sw-renderer/', async (request, values) => {
  const template = await fetchAndStore('/views/index.html').then(r => r.text())
  const headers = {'Content-Type': 'text/html'}

  return new Response(new Scope('Skeleton app', template), {headers})
})

// Todo page
router.get('/sw-renderer/todo', async (request, values) => {
  const template = await fetchAndStore(`/views/todo.html`).then(r => r.text())
  const headers = {'Content-Type': 'text/html'}

  return new Response(new Scope('Todos', template), {headers})
})

// Adding todo
router.post('/sw-renderer/add-todo', async (request, values) => {
  return Response.redirect('/')
})

// Fallback route
router.default = toolbox.cacheFirst
/*
router.default = request => {
  const url = new URL(request.url)

  if (request.url.startsWith(self.registration.scope)) {
    return toolbox.fastest(request)
  }

  if (request.headers.get('accept').includes('image')) {
    return toolbox.cacheFirst(request)
  }

  return fetch(url, request)
}
*/
