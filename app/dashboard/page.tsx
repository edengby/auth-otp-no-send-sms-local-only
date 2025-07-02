// app/dashboard/page.tsx
import { getSession, selectPhone, logout } from '@/app/actions/auth';

export default async function Dashboard() {
    const session = await getSession();
    if (!session) return <p>Please log in.</p>;

    return (
        <main className="p-4 max-w-md mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-xl">
                    Active: <strong>{session.selectedPhone}</strong>
                </h1>

                {/* 🔑 NEW Sign-out button */}
                <form action={logout}>
                    <button
                        type="submit"
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Sign&nbsp;Out
                    </button>
                </form>
            </header>

            <ul className="space-y-2">
                {session.children.map((child) => (
                    <li key={child}>
                        <form action={selectPhone}>
                            <input type="hidden" name="phone" value={child} />
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded ${
                                    session.selectedPhone === child
                                        ? 'bg-gray-400 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {child}
                            </button>
                        </form>
                    </li>
                ))}
            </ul>
        </main>
    );
}
