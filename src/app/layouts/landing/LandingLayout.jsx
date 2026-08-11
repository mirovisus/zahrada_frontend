import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { Footer } from '../../../widgets/footer';
import { ScrollToTop } from '../../scroll-to-top';

// /login a /signup sdílejí LandingLayout s landingem, ale mají mít stránku bez patičky webu
// (formulářová "Máte již účet / Nemáte účet" patička uvnitř LoginPage/SignupPage tím není dotčena)
const NO_FOOTER_PATHS = ['/login', '/signup'];

export function LandingLayout() {
  const location = useLocation();
  const hideFooter = NO_FOOTER_PATHS.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      <Header layout="landing" />
      <Outlet />
      {!hideFooter && <Footer />}
    </>
  );
}