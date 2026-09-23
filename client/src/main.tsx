import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { GuestOnly } from './auth/guards.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import { GamesPage } from './pages/GamesPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { Cursor } from './features/shared/ui/Cursor.tsx'
import { StylesGuidePage } from './pages/StylesGuidePage.tsx'

// Pages that need a signed-in player go under a `{ element: <RequireAuth /> }` route.
const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/games', element: <GamesPage /> },
  {
    element: <GuestOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  { path: '/styles-guide', element: <StylesGuidePage /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    <Cursor />
  </StrictMode>,
)
