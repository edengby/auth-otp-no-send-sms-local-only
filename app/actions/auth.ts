// app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export async function getSession() {
    const token = cookies().get('session')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode('secret'),
        { algorithms: ['HS256'] }
    );

    // destructure only the serializable bits into a fresh object
    const session = {
        phone:           (payload as any).phone       as string,
        children:        [...((payload as any).children as string[])],
        selectedPhone:   (payload as any).selectedPhone as string,
    };

    return session;   // now a plain object!
}

export async function selectPhone(formData: FormData) {
    const newPhone = formData.get('phone') as string;
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    session.selectedPhone = newPhone;
    const jwt = await new SignJWT(session)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode('secret'));
    cookies().set('session', jwt, { httpOnly: true, maxAge: 3600 });
}
