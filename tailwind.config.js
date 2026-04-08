/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './*.{tsx,ts}',
        './pages/**/*.{tsx,ts,jsx,js}',
        './components/**/*.{tsx,ts,jsx,js}'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
