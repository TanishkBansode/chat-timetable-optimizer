
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create root with explicit error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found");
} else {
  const root = createRoot(rootElement);
  root.render(<App />);
}
