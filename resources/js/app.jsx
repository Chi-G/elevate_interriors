import '../css/app.css';
import axios from 'axios';
window.axios = axios;

import './echo';

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import PageLoader from './Components/PageLoader';

const appName = import.meta.env.VITE_APP_NAME || 'Elevate Interiors';

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
            <>
                <PageLoader />
                <App {...props} />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
