// app/api/auth/get-code/route.ts
import { NextResponse } from 'next/server';
import {getCode} from "@/lib";       // ◀️ must come from 'next/server'

export async function POST(req: Request) {
    try {
        const { phone } = await req.json();

        const formData = new FormData();
        formData.append('phone', phone);

        const code = await getCode(formData);
        const res = NextResponse.json({ code });
        res.cookies.set('otp', code, {
            httpOnly: true,
            path: '/',
            maxAge: 5 * 60,
        });
        return res;
    } catch (err: any) {
        // always return valid JSON on error!
        return NextResponse.json(
            { error: err.message || 'Unknown error in get-code' },
            { status: 400 }
        );
    }
}
