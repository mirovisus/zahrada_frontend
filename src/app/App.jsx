import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from '../shared/auth';
import { ToastProvider } from '../shared/ui/toast';
import { ConfirmProvider } from '../shared/ui/confirm';

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;