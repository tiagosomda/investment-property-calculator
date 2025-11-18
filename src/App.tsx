import { BrowserRouter } from 'react-router-dom';
import { PropertyProvider, ThemeProvider, AuthProvider, CloudSyncProvider } from './contexts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRouter } from './AppRouter';

function App() {
  const basename = import.meta.env.PROD ? '/investment-property-calculator' : '/';

  return (
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <ThemeProvider>
          <AuthProvider>
            <CloudSyncProvider>
              <PropertyProvider>
                <AppRouter />
              </PropertyProvider>
            </CloudSyncProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
