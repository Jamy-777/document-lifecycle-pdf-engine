import { z } from "zod";

export const jazzFestivalTicketSchema = z.object({
    series: z.string().min(1),

    ticketNumber: z.string().min(1),

    presenter: z.string().min(1),

    eventTitle: z.string().min(1),

    eventYear: z.string().min(1),

    passType: z.string().min(1),

    dates: z.object({
        primary: z.string().min(1),
        secondary: z.string().optional(),
    }),

    gateTime: z.object({
        time: z.string().min(1),
        note: z.string().optional(),
    }),

    entry: z.object({
        gate: z.string().min(1),
        description: z.string().optional(),
    }),

    admission: z.object({
        quantity: z.number().int().positive(),
        rule: z.string().min(1),
    }),

    venue: z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        description: z.string().optional(),
        note: z.string().optional(),
    }),

    mapReference: z.string().min(1),

    stub: z.object({
        heading: z.string().min(1),
        gate: z.string().min(1),
        section: z.string().min(1),
        dates: z.string().min(1),
        reference: z.string().min(1),
    }),

    qrValue: z.string().min(1),

    website: z.string().min(1),

    printDate: z.string().min(1),
});

export type JazzFestivalTicketData =
    z.infer<typeof jazzFestivalTicketSchema>;