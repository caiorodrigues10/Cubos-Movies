import { Resend } from "resend";
import dayjs from "dayjs";
import { env } from "../env.js";

const resend = new Resend(env.RESEND_API_KEY);

type ReminderPayload = {
  to: string;
  movieTitle: string;
  releaseDate: Date;
};

export async function sendMovieReminderEmail({
  to,
  movieTitle,
  releaseDate,
}: ReminderPayload) {
  const formattedDate = dayjs(releaseDate).format("DD/MM/YYYY");
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `🎬 ${movieTitle} estreia hoje!`,
    html: `
      <div style="font-family:Arial, sans-serif;line-height:1.6">
        <h1>Hoje é dia de cinema! 🍿</h1>
        <p>O filme <strong>${movieTitle}</strong> estreia hoje (${formattedDate}).</p>
        <p>Não esqueça de atualizar o status dele no Cubos Movies após assistir.</p>
        <p style="margin-top:24px">Bom filme!<br/>Equipe Cubos Movies</p>
      </div>
    `,
  });
}

