import { createRoot } from 'react-dom/client';
import AppMain from 'src/AppMain';
import 'src/index.css';
import { registerSW } from 'virtual:pwa-register';

registerSW();

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<AppMain />);
}
