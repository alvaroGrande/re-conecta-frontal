import PrimeUI from 'tailwindcss-primeui';

/** @type {import('tailwindcss').Config} */

export default {
    darkMode: ['selector', '[class="p-dark"]'],
    plugins: [
        PrimeUI
    ],
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}", // Incluye todos tus componentes Vue y JS/TS
    ]
};