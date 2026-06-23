import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from '@/Context/AppContext';

const appName = import.meta.env.VITE_APP_NAME || 'ExpenseTracker';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <AppProvider>
                <Toaster position="top-right" />
                <App {...props} />
            </AppProvider>
        );
    },
    progress: {
        color: '#6366f1',
    },
});
