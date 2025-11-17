import { BrowserRouter } from 'react-router-dom';
import { PropertyProvider, ThemeProvider, AuthProvider, CloudSyncProvider } from './contexts';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRouter } from './AppRouter';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
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
