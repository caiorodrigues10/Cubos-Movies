import { RegisterForm } from "../../../components/auth/RegisterForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Cadastro - Cubos Movies",
};

export default function RegisterPage() {
	return <RegisterForm />;
}

