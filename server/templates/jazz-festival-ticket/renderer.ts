import PDFDocument from "pdfkit";
import * as QRCode from "qrcode";

import type {
    JazzFestivalTicketData,
} from "./schema";

const COLORS = {
    paper: "#F3EBDD",
    navy: "#17192F",
    accent: "#C94F39",
    gold: "#C49A45",
    muted: "#777268",
    white: "#F8F3E9",
};

function collectPdf(
    doc: PDFKit.PDFDocument,
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => {
            chunks.push(Buffer.from(chunk));
        });

        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);
    });
}

function drawLabel(
    doc: PDFKit.PDFDocument,
    label: string,
    x: number,
    y: number,
    width = 70,
) {
    doc
        .font("Helvetica")
        .fontSize(5.5)
        .fillColor(COLORS.muted)
        .text(label.toUpperCase(), x, y, {
            width,
            characterSpacing: 1.5,
        });
}

function drawDashedVerticalLine(
    doc: PDFKit.PDFDocument,
    x: number,
    top: number,
    bottom: number,
) {
    doc
        .save()
        .strokeColor(COLORS.paper)
        .opacity(0.8)
        .dash(2, {
            space: 3,
        })
        .moveTo(x, top)
        .lineTo(x, bottom)
        .stroke()
        .undash()
        .opacity(1)
        .restore();
}

export async function renderJazzFestivalTicket(
    data: JazzFestivalTicketData,
): Promise<Buffer> {
    const PAGE_WIDTH = 720;
    const PAGE_HEIGHT = 520;

    const doc = new PDFDocument({
        size: [
            PAGE_WIDTH,
            PAGE_HEIGHT,
        ],
        margin: 0,
        info: {
            Title: `${data.passType} - ${data.eventTitle} ${data.eventYear}`,
            Subject: "Event Ticket",
            Creator: "Document Lifecycle & PDF Rendering Engine",
        },
    });

    const output = collectPdf(doc);
    const ticketX = 55;
    const ticketY = 45;

    const ticketWidth = 610;
    const ticketHeight = 420;

    const footerHeight = 38;

    const contentHeight =
        ticketHeight - footerHeight;

    const stubWidth = 160;

    const mainWidth =
        ticketWidth - stubWidth;

    const stubX =
        ticketX + mainWidth;
    doc
        .rect(
            ticketX,
            ticketY,
            ticketWidth,
            ticketHeight,
        )
        .fill(COLORS.paper);
    doc
        .lineWidth(1.2)
        .strokeColor(COLORS.navy)
        .rect(
            ticketX + 12,
            ticketY + 12,
            mainWidth - 12,
            contentHeight - 12,
        )
        .stroke();
    doc
        .rect(
            stubX,
            ticketY + 12,
            stubWidth - 12,
            contentHeight - 12,
        )
        .fill(COLORS.navy);
    drawDashedVerticalLine(
        doc,
        stubX,
        ticketY + 12,
        ticketY + contentHeight,
    );
    const left =
        ticketX + 52;

    const right =
        stubX - 38;

    const usableWidth =
        right - left;
    const topY =
        ticketY + 42;

    doc
        .fillColor(COLORS.accent)
        .rect(
            left,
            topY - 4,
            102,
            19,
        )
        .fill();

    doc
        .font("Courier-Bold")
        .fontSize(7)
        .fillColor(COLORS.white)
        .text(
            `SERIES • ${data.series}`,
            left + 9,
            topY + 2,
            {
                width: 88,
                characterSpacing: 1.2,
            },
        );

    doc
        .font("Courier")
        .fontSize(7)
        .fillColor(COLORS.navy)
        .text(
            `NO. ${data.ticketNumber}`,
            left + 145,
            topY + 2,
            {
                width: 145,
            },
        );

    doc
        .font("Times-BoldItalic")
        .fontSize(10)
        .text(
            "EST. 1989",
            right - 68,
            topY,
            {
                width: 68,
                align: "right",
            },
        );
    doc
        .moveTo(
            left,
            topY + 34,
        )
        .lineTo(
            right,
            topY + 34,
        )
        .lineWidth(0.7)
        .strokeColor(COLORS.navy)
        .stroke();
    const presenterY =
        topY + 70;

    doc
        .font("Courier")
        .fontSize(7)
        .fillColor(COLORS.muted)
        .text(
            data.presenter.toUpperCase(),
            left,
            presenterY,
            {
                width: usableWidth,
                characterSpacing: 2.3,
            },
        );
    const titleY =
        presenterY + 27;

    doc
        .font("Times-Bold")
        .fontSize(31)
        .fillColor(COLORS.navy)
        .text(
            "Jazz",
            left,
            titleY,
            {
                lineBreak: false,
            },
        );

    doc
        .font("Times-Italic")
        .fontSize(30)
        .fillColor(COLORS.accent)
        .text(
            data.eventTitle
                .replace(/^Jazz\s*/i, ""),
            left,
            titleY + 31,
            {
                continued: true,
            },
        );

    doc
        .font("Times-Bold")
        .fillColor(COLORS.navy)
        .text(
            data.eventYear,
            {
                continued: false,
            },
        );
    const badgeY =
        titleY + 77;

    doc
        .fillColor(COLORS.navy)
        .rect(
            left,
            badgeY,
            205,
            29,
        )
        .fill();

    doc
        .font("Courier-Bold")
        .fontSize(8)
        .fillColor(COLORS.gold)
        .text(
            "★",
            left + 14,
            badgeY + 9,
        );

    doc
        .fillColor(COLORS.white)
        .text(
            data.passType,
            left + 35,
            badgeY + 9,
            {
                width: 140,
                align: "center",
                characterSpacing: 1,
            },
        );

    doc
        .fillColor(COLORS.gold)
        .text(
            "★",
            left + 184,
            badgeY + 9,
        );
    const metadataTop =
        badgeY + 60;

    doc
        .moveTo(
            left,
            metadataTop,
        )
        .lineTo(
            right,
            metadataTop,
        )
        .lineWidth(0.6)
        .strokeColor(COLORS.navy)
        .stroke();
    const gridY =
        metadataTop + 29;

    const columnWidth =
        usableWidth / 4;
    drawLabel(
        doc,
        "Dates",
        left,
        gridY,
        columnWidth - 10,
    );

    doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor(COLORS.navy)
        .text(
            data.dates.primary,
            left,
            gridY + 17,
            {
                width: columnWidth - 10,
            },
        );

    if (data.dates.secondary) {
        doc
            .font("Courier")
            .fontSize(6)
            .fillColor(COLORS.muted)
            .text(
                data.dates.secondary,
                left,
                gridY + 44,
                {
                    width: columnWidth - 10,
                },
            );
    }
    const gateX =
        left + columnWidth;

    drawLabel(
        doc,
        "Gates",
        gateX,
        gridY,
        columnWidth - 10,
    );

    doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor(COLORS.navy)
        .text(
            data.gateTime.time,
            gateX,
            gridY + 17,
            {
                width: columnWidth - 10,
            },
        );

    if (data.gateTime.note) {
        doc
            .font("Courier")
            .fontSize(6)
            .fillColor(COLORS.muted)
            .text(
                data.gateTime.note,
                gateX,
                gridY + 44,
                {
                    width: columnWidth - 10,
                },
            );
    }
    const entryX =
        left + columnWidth * 2;

    drawLabel(
        doc,
        "Entry",
        entryX,
        gridY,
        columnWidth - 10,
    );

    doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor(COLORS.navy)
        .text(
            data.entry.gate,
            entryX,
            gridY + 17,
            {
                width: columnWidth - 10,
            },
        );

    if (data.entry.description) {
        doc
            .font("Courier")
            .fontSize(6)
            .fillColor(COLORS.muted)
            .text(
                data.entry.description,
                entryX,
                gridY + 44,
                {
                    width: columnWidth - 10,
                },
            );
    }
    const admitsX =
        left + columnWidth * 3;

    drawLabel(
        doc,
        "Admits",
        admitsX,
        gridY,
        columnWidth - 10,
    );

    doc
        .font("Times-Bold")
        .fontSize(12)
        .fillColor(COLORS.navy)
        .text(
            String(data.admission.quantity)
                .padStart(2, "0"),
            admitsX,
            gridY + 17,
            {
                width: columnWidth - 10,
            },
        );

    doc
        .font("Courier")
        .fontSize(6)
        .fillColor(COLORS.muted)
        .text(
            data.admission.rule,
            admitsX,
            gridY + 44,
            {
                width: columnWidth - 10,
            },
        );
    const venueDividerY =
        gridY + 81;

    doc
        .moveTo(
            left,
            venueDividerY,
        )
        .lineTo(
            right,
            venueDividerY,
        )
        .lineWidth(0.6)
        .strokeColor(COLORS.navy)
        .stroke();
    const venueY =
        venueDividerY + 20;

    drawLabel(
        doc,
        "Venue",
        left,
        venueY,
        150,
    );

    doc
        .font("Times-BoldItalic")
        .fontSize(15)
        .fillColor(COLORS.navy)
        .text(
            data.venue.name,
            left,
            venueY + 18,
            {
                width: 250,
            },
        );

    doc
        .font("Courier")
        .fontSize(6)
        .fillColor(COLORS.muted)
        .text(
            data.venue.address,
            left,
            venueY + 53,
            {
                width: 270,
            },
        );

    const venueDetails = [
        data.venue.description,
        data.venue.note,
    ]
        .filter(Boolean)
        .join(" · ");

    if (venueDetails) {
        doc.text(
            venueDetails,
            left,
            venueY + 69,
            {
                width: 270,
            },
        );
    }
    const mapX =
        right - 102;

    const mapY =
        venueY + 28;

    doc
        .lineWidth(0.8)
        .strokeColor(COLORS.navy)
        .rect(
            mapX,
            mapY,
            92,
            55,
        )
        .stroke();

    doc
        .font("Times-Bold")
        .fontSize(17)
        .fillColor(COLORS.accent)
        .text(
            data.mapReference,
            mapX,
            mapY + 11,
            {
                width: 92,
                align: "center",
            },
        );

    doc
        .font("Courier")
        .fontSize(5)
        .fillColor(COLORS.muted)
        .text(
            "MAP REFERENCE",
            mapX,
            mapY + 37,
            {
                width: 92,
                align: "center",
                characterSpacing: 1,
            },
        );
    const stubCenter =
        stubX + stubWidth / 2 - 6;

    doc
        .font("Courier")
        .fontSize(6)
        .fillColor(COLORS.gold)
        .text(
            "ADMIT ONE",
            stubX + 20,
            ticketY + 43,
            {
                width: stubWidth - 40,
                align: "center",
                characterSpacing: 1.8,
            },
        );

    doc
        .font("Times-BoldItalic")
        .fontSize(18)
        .fillColor(COLORS.white)
        .text(
            data.stub.heading,
            stubX + 20,
            ticketY + 67,
            {
                width: stubWidth - 40,
                align: "center",
            },
        );
    const qrDataUrl =
        await QRCode.toDataURL(
            data.qrValue,
            {
                errorCorrectionLevel: "M",
                margin: 1,
                width: 220,
                color: {
                    dark: "#17192FFF",
                    light: "#F3EBDDFF",
                },
            },
        );

    const qrBuffer =
        Buffer.from(
            qrDataUrl.split(",")[1]!,
            "base64",
        );

    const qrSize = 92;

    const qrX =
        stubCenter - qrSize / 2;

    const qrY =
        ticketY + 123;

    doc
        .fillColor(COLORS.paper)
        .rect(
            qrX - 8,
            qrY - 8,
            qrSize + 16,
            qrSize + 16,
        )
        .fill();

    doc.image(
        qrBuffer,
        qrX,
        qrY,
        {
            width: qrSize,
            height: qrSize,
        },
    );
    doc
        .font("Courier")
        .fontSize(6)
        .fillColor(COLORS.white)
        .text(
            `${data.stub.gate} · Sect. ${data.stub.section}`,
            stubX + 15,
            qrY + 122,
            {
                width: stubWidth - 30,
                align: "center",
            },
        );

    doc
        .font("Times-BoldItalic")
        .fontSize(10)
        .text(
            data.stub.dates,
            stubX + 15,
            qrY + 143,
            {
                width: stubWidth - 30,
                align: "center",
            },
        );
    const stubBottomY =
        ticketY + contentHeight - 43;

    doc
        .moveTo(
            stubX + 20,
            stubBottomY - 12,
        )
        .lineTo(
            stubX + stubWidth - 22,
            stubBottomY - 12,
        )
        .lineWidth(0.4)
        .strokeColor(COLORS.gold)
        .opacity(0.45)
        .stroke()
        .opacity(1);

    doc
        .font("Courier-Bold")
        .fontSize(5.5)
        .fillColor(COLORS.gold)
        .text(
            data.stub.reference,
            stubX + 18,
            stubBottomY,
            {
                width: stubWidth - 36,
                align: "center",
                characterSpacing: 1,
            },
        );
    const footerY =
        ticketY + contentHeight;

    doc
        .font("Courier")
        .fontSize(5.5)
        .fillColor(COLORS.muted)
        .text(
            `SCAN AT ${data.entry.gate.toUpperCase()} • KEEP TICKET INTACT`,
            ticketX + 22,
            footerY + 15,
            {
                width: 220,
                characterSpacing: 1.1,
            },
        );

    doc.text(
        data.website.toUpperCase(),
        ticketX + 260,
        footerY + 15,
        {
            width: 170,
            align: "center",
            characterSpacing: 1.1,
        },
    );

    doc.text(
        `PRINTED ${data.printDate}`,
        stubX + 8,
        footerY + 15,
        {
            width: stubWidth - 16,
            align: "right",
            characterSpacing: 1.1,
        },
    );
    doc.end();

    return output;
}
