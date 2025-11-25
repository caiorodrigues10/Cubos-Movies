import cron from "node-cron";
import dayjs from "dayjs";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../lib/prisma.js";
import { sendMovieReminderEmail } from "./emailService.js";

class ReminderService {
  private started = false;

  start(logger: FastifyBaseLogger) {
    if (this.started) return;
    this.started = true;

    this.run(logger).catch((error) =>
      logger.error({ err: error }, "Reminder job failed at bootstrap")
    );

    cron.schedule("0 * * * *", () => {
      this.run(logger).catch((error) =>
        logger.error({ err: error }, "Reminder job crashed")
      );
    });
  }

  private async run(logger: FastifyBaseLogger) {
    const startOfDay = dayjs().startOf("day").toDate();
    const endOfDay = dayjs().endOf("day").toDate();

    const movies = await prisma.movie.findMany({
      where: {
        releaseDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        reminderSent: false,
      },
      include: {
        owner: true,
      },
    });

    for (const movie of movies) {
      if (!movie.owner || !movie.releaseDate) continue;
      try {
        await sendMovieReminderEmail({
          to: movie.owner.email,
          movieTitle: movie.title,
          releaseDate: movie.releaseDate,
        });

        await prisma.movie.update({
          where: { id: movie.id },
          data: { reminderSent: true },
        });
      } catch (error) {
        logger.error(
          { err: error, movieId: movie.id },
          "Failed to send reminder email"
        );
      }
    }
  }
}

export const reminderScheduler = new ReminderService();

