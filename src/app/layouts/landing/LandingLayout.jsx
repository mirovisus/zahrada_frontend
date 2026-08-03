import { Outlet } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer';
import { ScrollToTop } from '../../scroll-to-top';

export function LandingLayout() {
  return (
    <>
      <ScrollToTop />
      <Header layout="landing" />
      <Outlet />
      <Footer />
    </>
  );
}