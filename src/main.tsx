import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

const rawKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;
const PUBLISHABLE_KEY = typeof rawKey === 'string' ? rawKey.trim() : rawKey;

const isValidPublishableKey = (key: any) => {
  return typeof key === 'string' && key.length > 0 && (key.startsWith('pk_test_') || key.startsWith('pk_live_'));
};

if (!PUBLISHABLE_KEY || !isValidPublishableKey(PUBLISHABLE_KEY)) {
  const isSecretKey = typeof PUBLISHABLE_KEY === 'string' && PUBLISHABLE_KEY.startsWith('sk_');
  
  createRoot(document.getElementById('root')!).render(
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-red-100">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Geçersiz API Anahtarı</h1>
        <p className="text-gray-600 mb-6">
          {isSecretKey ? (
            <>
              Görünüşe göre <strong>Secret Key</strong> (sk_...) girdiniz. 
              Lütfen bunun yerine <strong>Publishable Key</strong> (pk_...) kullanın.
            </>
          ) : (
            <>
              Girdiğiniz <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> geçerli bir Clerk anahtarı formatında değil.
            </>
          )}
        </p>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-sm font-semibold text-blue-800 mb-1">Doğru Anahtarı Nerede Bulurum?</h2>
            <p className="text-xs text-blue-600">
              Clerk Dashboard {">"} API Keys bölümüne gidin. "Publishable Key" etiketli, 
              <strong>pk_test_</strong> veya <strong>pk_live_</strong> ile başlayan değeri kopyalayın.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-xs font-mono text-gray-500 break-all">
            Mevcut Değer: {PUBLISHABLE_KEY ? `"${PUBLISHABLE_KEY}"` : "(Boş veya Tanımsız)"}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    </div>
  );
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <ClerkProvider 
          publishableKey={PUBLISHABLE_KEY}
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ClerkProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
