// app/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Step 1: request OTP
    async function handleGetCode(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/auth/get-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });

            // Always try to parse JSON, even on success
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.error || 'Failed to get code.');
            } else {
                setCode(data.code);
                setStep('otp');
            }
        } catch (err: any) {
            setError(err.message || 'Network error.');
        } finally {
            setLoading(false);
        }
    }

    // Step 2: verify OTP
    async function handleVerifyCode(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, code: otp }),
            });

            if (!res.ok) {
                // Parse error payload safely
                const errData = await res.json().catch(() => ({}));
                setError(errData.error || 'Verification failed.');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Network error.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto p-6">
            {step === 'phone' ? (
                <form onSubmit={handleGetCode} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Phone number"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        className="border p-2 rounded"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {loading ? 'Sending…' : 'Get Code'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
                    <p>
                        Your code is: <strong>{code}</strong>
                    </p>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        required
                        className="border p-2 rounded"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            )}

            {error && (
                <div className="mt-4 text-red-600">
                    {error}
                </div>
            )}
        </div>
    );
}
