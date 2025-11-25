import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "../../../../lib/env";

export async function POST(request: Request) {
	try {
		const { token, userId } = await request.json();
		const cookieStore = await cookies();

		cookieStore.set(env.COOKIE_NAME, token, {
			httpOnly: true,
			path: "/",
			secure: true,
			sameSite: "lax",
		});
		cookieStore.set(env.COOKIE_USER_ID, userId, {
			httpOnly: true,
			path: "/",
			secure: true,
			sameSite: "lax",
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Erro ao salvar cookies" },
			{ status: 400 }
		);
	}
}

