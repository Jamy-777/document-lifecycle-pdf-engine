import {
    writeFile,
} from "node:fs/promises";

import {
    jazzFestivalTicketFixture,
} from "../server/templates/jazz-festival-ticket/fixture";

import {
    renderJazzFestivalTicket,
} from "../server/templates/jazz-festival-ticket/renderer";
const pdf =
    await renderJazzFestivalTicket(
        jazzFestivalTicketFixture,
    );

await writeFile(
    "ticket-preview.pdf",
    pdf,
);

console.log(
    "Created ticket-preview.pdf",
);

const customData = {
    ...jazzFestivalTicketFixture,

    series: "999",

    ticketNumber: "CUSTOM-999",

    eventTitle: "Jazz Festival",

    eventYear: "2027",

    entry: {
        ...jazzFestivalTicketFixture.entry,
        gate: "Gate A",
    },

    venue: {
        ...jazzFestivalTicketFixture.venue,
        name: "Moonlight Arena",
    },

    mapReference: "A-7",

    qrValue: "CUSTOM-999",
};

const customPdf =
    await renderJazzFestivalTicket(
        customData,
    );

await writeFile(
    "ticket-preview-custom.pdf",
    customPdf,
);

console.log(
    "Created ticket-preview-custom.pdf",
);
