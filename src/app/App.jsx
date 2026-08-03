import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from '../shared/auth';
import { ToastProvider } from '../shared/ui/toast';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;