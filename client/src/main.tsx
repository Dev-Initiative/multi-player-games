import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { GuestOnly } from './auth/guards.tsx'
import { RootLayout } from './features/shared/ui/RootLayout.tsx'
import { Connect4Page } from './pages/Connect4Page.tsx'
import { GamesPage } from './pages/GamesPage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { MyGamesPage } from './pages/MyGamesPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import { StylesGuidePage } from './pages/StylesGuidePage.tsx'

// Pages that need a signed-in player go under a `{ element: <RequireAuth /> }` route.
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/games', element: <GamesPage /> },
      { path: '/games/connect-4/:gameId', element: <Connect4Page /> },
      { path: '/my-games', element: <MyGamesPage /> },
      {
        element: <GuestOnly />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      { path: '/styles-guide', element: <StylesGuidePage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
