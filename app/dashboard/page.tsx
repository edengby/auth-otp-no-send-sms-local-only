import {getSession, selectPhone} from "@/app/actions/auth";

export default async function Dashboard() {
    const session = await getSession();
    if (!session) {
        return <p>Please log in first.</p>;
    }

    return (
        <main className="p-4 max-w-md mx-auto">
            <h1 className="text-xl mb-4">
                Active: <strong>{session.selectedPhone}</strong>
            </h1>
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
                                        : 'bg-blue-600 text-white'
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
