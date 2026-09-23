import type {
    JazzFestivalTicketData,
} from "./schema";

export const jazzFestivalTicketFixture:
    JazzFestivalTicketData = {
    series: "017",

    ticketNumber: "RJF26-00482",

    presenter: "RIVERSIDE PRESENTS",

    eventTitle: "Jazz Festival",

    eventYear: "2026",

    passType: "VIP Weekend Pass",

    dates: {
        primary: "Jul 18–19",
        secondary: "Saturday & Sunday",
    },

    gateTime: {
        time: "12:00 PM",
        note: "First set 1:30 PM",
    },

    entry: {
        gate: "Gate C",
        description: "VIP Lane · West",
    },

    admission: {
        quantity: 1,
        rule: "Non-transferable",
    },

    venue: {
        name: "Willow Bend Riverfront Park",
        address: "1420 Harbor Promenade · Main Stage & North Pavilion",
        description: "Main or shine",
        note: "Ages 18+ for VIP Lounge",
    },

    mapReference: "C–4",

    stub: {
        heading: "VIP Weekend",
        gate: "Gate C",
        section: "VIP",
        dates: "Jul 18–19, 2026",
        reference: "RJF26 · 00482 · VIP",
    },

    qrValue: "RJF26-00482",

    website: "RIVERSIDEJAZZ.FEST",

    printDate: "04.11.2026",
};