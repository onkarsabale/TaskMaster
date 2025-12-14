const Unauthorized = () => {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center">
            <h1 className="text-6xl font-bold text-red-600">403</h1>
            <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">Access Denied</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                You do not have permission to view this page.
            </p>
            <a
                href="/"
                className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
            >
                Go to Dashboard
            </a>
        </div>
    );
};

export default Unauthorized;

