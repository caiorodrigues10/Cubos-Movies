import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendMovieReminderEmail } from "./emailService.js";
import { Resend } from "resend";

// Mock do Resend
vi.mock("resend");

describe("EmailService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send reminder email with correct format", async () => {
    const mockSend = vi.fn().mockResolvedValue({ id: "email-id" });
    vi.mocked(Resend).mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    } as any));

    const releaseDate = new Date("2024-12-25");
    await sendMovieReminderEmail({
      to: "user@example.com",
      movieTitle: "Bumblebee",
      releaseDate,
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: expect.stringContaining("Bumblebee"),
        html: expect.stringContaining("Bumblebee"),
      })
    );
  });

  it("should format release date correctly", async () => {
    const mockSend = vi.fn().mockResolvedValue({ id: "email-id" });
    vi.mocked(Resend).mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    } as any));

    const releaseDate = new Date("2024-12-25");
    await sendMovieReminderEmail({
      to: "user@example.com",
      movieTitle: "Test Movie",
      releaseDate,
    });

    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.html).toContain("25/12/2024");
  });
});

