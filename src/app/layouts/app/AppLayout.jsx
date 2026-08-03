import { Outlet } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { ScrollToTop } from '../../scroll-to-top';

export function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <Header layout="app" />
      <Outlet />
    </>
  );
}