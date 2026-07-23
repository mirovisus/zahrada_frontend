import { createBrowserRouter } from 'react-router-dom';
import { LandingLayout } from '../layouts/landing';
import { AppLayout } from '../layouts/app';
import { RequireAuth } from '../providers';

import { MainPage } from '../../pages/main';
import { CatalogPage } from '../../pages/catalog';
import { ApplicationPage } from '../../pages/application';
import { LoginPage } from '../../pages/login';
import { SignupPage } from '../../pages/signup';
import { ProfilePage } from '../../pages/profile';
import { GardenCreatePage } from '../../pages/garden-create';
import { GardenEditPage } from '../../pages/garden-edit';

export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      { path: '/', element: <MainPage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/application', element: <ApplicationPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/profile',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: '/garden/new',
        element: (
          <RequireAuth>
            <GardenCreatePage />
          </RequireAuth>
        ),
      },
      {
        path: '/garden/:id',
        element: (
          <RequireAuth>
            <GardenEditPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);