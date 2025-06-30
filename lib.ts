import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

const guardians = [
  { phone: "+972501111111", children: ["+972502222222", "+972503333333"] },
  { phone: "+972504444444", children: ["+972505555555"] },
  // …add as needed
] as const;

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10 sec from now")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function login(formData: FormData) {
  // Verify credentials && get the user

  const user = { email: formData.get("email"), name: "John" };

  // Create the session
  const expires = new Date(Date.now() + 10 * 1000);
  const session = await encrypt({ user, expires });

  // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 10 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}


// In-memory code store (in production use Redis or DB)
const codeStore = new Map<string, string>();

// 1️⃣ Server Action to get or reject a code
export async function getCode(formData: FormData) {
  "use server";
  const phone = formData.get("phone") as string;
  const entry = guardians.find((g) => g.phone === phone);
  if (!entry) throw new Error("Unknown number.");         // step 1 error
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codeStore.set(phone, code);
  return code;                                             // displayed inline
}

// 2️⃣ Server Action to verify code & create session
export async function verifyCode(formData: FormData) {
  "use server";
  const phone = formData.get("phone") as string;
  const code = formData.get("code") as string;
  const valid = codeStore.get(phone) === code;
  if (!valid) throw new Error("Invalid code – please try again."); // step 2 error

  // build payload: user’s phone, children array, and default selectedPhone
  const payload = { phone, children: guardians.find(g => g.phone === phone)!.children, selectedPhone: phone };
  const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(key);

  // set cookie
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  cookies().set("session", jwt, { httpOnly: true, expires });
}

// 3️⃣ Helper to read session
export async function getSession() {
  const token = cookies().get("session")?.value;
  if (!token) return null;
  const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
  return payload;
}

// 4️⃣ Server Action to swap selectedPhone
export async function selectPhone(formData: FormData) {
  "use server";
  const newPhone = formData.get("phone") as string;
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  session.selectedPhone = newPhone;
  // re-encrypt with updated payload
  const jwt = await new SignJWT(session)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor((session as any).exp || (Date.now()/1000)+3600) + " sec")
      .sign(key);
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set("session", jwt, { httpOnly: true, expires });
  return res;
}