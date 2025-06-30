// app/api/auth/verify-code/route.ts
import { cookies }     from 'next/headers';
import { NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode('secret');
const guardians = [
    { phone: '+972501111111', children: ['+972502222222','+972503333333'] },
    { phone: '+972504444444', children: ['+972505555555'] },
] as const;

export async function POST(req: Request) {
    try {
        const { phone, code: submitted } = await req.json();

        // 1️⃣ Read the OTP from the cookie
        const store = cookies();
        const stored = store.get('otp')?.value;
        if (!stored) throw new Error('OTP expired or missing.');
        if (stored !== submitted) throw new Error('Invalid code – please try again.');

        // 2️⃣ Clear the OTP cookie
        const res = NextResponse.json({ success: true });
        res.cookies.set('otp', '', { maxAge: 0, path: '/' });

        // 3️⃣ Create and set the SESSION JWT
        const entry = guardians.find((g) => g.phone === phone)!;
        const payload = { phone, children: entry.children, selectedPhone: phone };
        const jwt = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(secret);

        res.cookies.set('session', jwt, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60,
        });

        return res;
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message },
            { status: 400 }
        );
    }
}
