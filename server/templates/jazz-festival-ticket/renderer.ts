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
            lineBreak: false,
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
    const PAGE_HEIGHT = 500;

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
    const ticketY = 32;

    const ticketWidth = 610;
    const ticketHeight = 436;

    const footerHeight = 36;
    const contentHeight = ticketHeight - footerHeight;

    const stubWidth = 160;
    const mainWidth = ticketWidth - stubWidth;
    const stubX = ticketX + mainWidth;

    const innerPadding = 12;
    const innerX = ticketX + innerPadding;
    const innerY = ticketY + innerPadding;
    const innerWidth = mainWidth - innerPadding;
    const innerHeight = contentHeight - innerPadding;

    const stubInnerX = stubX;
    const stubInnerY = ticketY + innerPadding;
    const stubInnerWidth = stubWidth - innerPadding;
    const stubInnerHeight = innerHeight;

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
            innerX,
            innerY,
            innerWidth,
            innerHeight,
        )
        .stroke();

    doc
        .rect(
            stubInnerX,
            stubInnerY,
            stubInnerWidth,
            stubInnerHeight,
        )
        .fill(COLORS.navy);

    drawDashedVerticalLine(
        doc,
        stubX,
        stubInnerY,
        stubInnerY + stubInnerHeight,
    );

    const left = innerX + 28;
    const right = stubX - 25;
    const usableWidth = right - left;

    const topY = innerY + 18;

    doc
        .fillColor(COLORS.accent)
        .rect(
            left,
            topY - 3,
            96,
            18,
        )
        .fill();

    doc
        .font("Courier-Bold")
        .fontSize(7)
        .fillColor(COLORS.white)
        .text(
            `SERIES • ${data.series}`,
            left + 9,
            topY + 3,
            {
                width: 80,
                characterSpacing: 1.2,
                lineBreak: false,
            },
        );

    doc
        .font("Courier")
        .fontSize(7)
        .fillColor(COLORS.navy)
        .text(
            `NO. ${data.ticketNumber}`,
            left + 125,
            topY + 3,
            {
                width: 140,
                lineBreak: false,
            },
        );

    doc
        .font("Times-BoldItalic")
        .fontSize(10)
        .text(
            "EST. 1989",
            right - 70,
            topY + 2,
            {
                width: 70,
                align: "right",
                lineBreak: false,
            },
        );

    doc
        .moveTo(left, topY + 27)
        .lineTo(right, topY + 27)
        .lineWidth(0.7)
        .strokeColor(COLORS.navy)
        .stroke();

    const presenterY = topY + 40;

    doc
        .font("Courier")
        .fontSize(6.5)
        .fillColor(COLORS.muted)
        .text(
            data.presenter.toUpperCase(),
            left,
            presenterY,
            {
                width: usableWidth,
                characterSpacing: 2.2,
                lineBreak: false,
            },
        );

    const titleY = presenterY + 16;

    doc
        .font("Times-Bold")
        .fontSize(28)
        .fillColor(COLORS.navy)
        .text(
            "Jazz",
            left,
            titleY,
            {
                lineBreak: false,
            },
        );

    const restOfTitle = data.eventTitle.replace(/^Jazz\s*/i, "");

    doc
        .font("Times-Italic")
        .fontSize(27)
        .fillColor(COLORS.accent)
        .text(
            restOfTitle ? `${restOfTitle} ` : "",
            left,
            titleY + 30,
            {
                continued: true,
                lineBreak: false,
            },
        );

    doc
        .font("Times-Bold")
        .fillColor(COLORS.navy)
        .text(
            data.eventYear,
            {
                continued: false,
                lineBreak: false,
            },
        );

    const badgeY = titleY + 70;

    doc
        .fillColor(COLORS.navy)
        .rect(
            left,
            badgeY,
            195,
            24,
        )
        .fill();

    doc
        .font("Courier-Bold")
        .fontSize(8)
        .fillColor(COLORS.gold)
        .text(
            "★",
            left + 12,
            badgeY + 7,
            {
                lineBreak: false,
            },
        );

    doc
        .fillColor(COLORS.white)
        .text(
            data.passType,
            left + 28,
            badgeY + 7,
            {
                width: 140,
                align: "center",
                characterSpacing: 1,
                lineBreak: false,
            },
        );

    doc
        .fillColor(COLORS.gold)
        .text(
            "★",
            left + 175,
            badgeY + 7,
            {
                lineBreak: false,
            },
        );

    const metadataTop = badgeY + 40;

    doc
        .moveTo(left, metadataTop)
        .lineTo(right, metadataTop)
        .lineWidth(0.6)
        .strokeColor(COLORS.navy)
        .stroke();

    const gridY = metadataTop + 13;
    const columnWidth = usableWidth / 4;

    drawLabel(
        doc,
        "Dates",
        left,
        gridY,
        columnWidth - 10,
    );

    doc
        .font("Times-Bold")
        .fontSize(11.5)
        .fillColor(COLORS.navy)
        .text(
            data.dates.primary,
            left,
            gridY + 14,
            {
                width: columnWidth - 10,
                lineBreak: false,
            },
        );

    if (data.dates.secondary) {
        doc
            .font("Courier")
            .fontSize(5.5)
            .fillColor(COLORS.muted)
            .text(
                data.dates.secondary,
                left,
                gridY + 30,
                {
                    width: columnWidth - 10,
                    lineBreak: false,
                },
            );
    }

    const gateX = left + columnWidth;

    drawLabel(
        doc,
        "Gates",
        gateX,
        gridY,
        columnWidth - 10,
    );

    doc
        .font("Times-Bold")
        .fontSize(11.5)
        .fillColor(COLORS.navy)
        .text(
            data.gateTime.time,
            gateX,
            gridY + 14,
            {
                width: columnWidth - 10,
                lineBreak: false,
            },
        );

    if (data.gateTime.note) {
        doc
            .font("Courier")
            .fontSize(5.5)
            .fillColor(COLORS.muted)
            .text(
                data.gateTime.note,
                gateX,
                gridY + 30,
                {
                    width: columnWidth - 10,
                    lineBreak: false,
                },
            );
    }

    const entryX = left + columnWidth * 2;

    drawLabel(
        doc,
        "Entry",
        entryX,
        gridY,
        columnWidth - 10,
    );

    doc
        .font("Times-Bold")
        .fontSize(11.5)
        .fillColor(COLORS.navy)
        .text(
            data.entry.gate,
            entryX,
            gridY + 14,
            {
                width: columnWidth - 10,
                lineBreak: false,
            },
        );

    if (data.entry.description) {
        doc
            .font("Courier")
            .fontSize(5.5)
            .fillColor(COLORS.muted)
            .text(
                data.entry.description,
                entryX,
                gridY + 30,
                {
                    width: columnWidth - 10,
                    lineBreak: false,
                },
            );
    }

    const admitsX = left + columnWidth * 3;

    drawLabel(
        doc,
        "Admits",
        admitsX,
        gridY,
        columnWidth - 10,
    );

    doc
        .font("Times-Bold")
        .fontSize(11.5)
        .fillColor(COLORS.navy)
        .text(
            String(data.admission.quantity).padStart(2, "0"),
            admitsX,
            gridY + 14,
            {
                width: columnWidth - 10,
                lineBreak: false,
            },
        );

    doc
        .font("Courier")
        .fontSize(5.5)
        .fillColor(COLORS.muted)
        .text(
            data.admission.rule,
            admitsX,
            gridY + 30,
            {
                width: columnWidth - 10,
                lineBreak: false,
            },
        );

    const venueDividerY = gridY + 50;

    doc
        .moveTo(left, venueDividerY)
        .lineTo(right, venueDividerY)
        .lineWidth(0.6)
        .strokeColor(COLORS.navy)
        .stroke();

    const venueY = venueDividerY + 13;

    drawLabel(
        doc,
        "Venue",
        left,
        venueY,
        150,
    );

    doc
        .font("Times-BoldItalic")
        .fontSize(13.5)
        .fillColor(COLORS.navy)
        .text(
            data.venue.name,
            left,
            venueY + 14,
            {
                width: 250,
                lineBreak: false,
            },
        );

    doc
        .font("Courier")
        .fontSize(5.5)
        .fillColor(COLORS.muted)
        .text(
            data.venue.address,
            left,
            venueY + 33,
            {
                width: 260,
                lineBreak: false,
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
            venueY + 45,
            {
                width: 260,
                lineBreak: false,
            },
        );
    }

    const mapWidth = 86;
    const mapHeight = 50;
    const mapX = right - mapWidth;
    const mapY = venueY + 4;

    doc
        .lineWidth(0.8)
        .strokeColor(COLORS.navy)
        .rect(
            mapX,
            mapY,
            mapWidth,
            mapHeight,
        )
        .stroke();

    doc
        .font("Times-Bold")
        .fontSize(16)
        .fillColor(COLORS.accent)
        .text(
            data.mapReference,
            mapX,
            mapY + 10,
            {
                width: mapWidth,
                align: "center",
                lineBreak: false,
            },
        );

    doc
        .font("Courier")
        .fontSize(5)
        .fillColor(COLORS.muted)
        .text(
            "MAP REFERENCE",
            mapX,
            mapY + 32,
            {
                width: mapWidth,
                align: "center",
                characterSpacing: 1,
                lineBreak: false,
            },
        );

    const stubCenter = stubInnerX + stubInnerWidth / 2;

    doc
        .font("Courier-Bold")
        .fontSize(6)
        .fillColor(COLORS.gold)
        .text(
            "ADMIT ONE",
            stubInnerX + 10,
            stubInnerY + 20,
            {
                width: stubInnerWidth - 20,
                align: "center",
                characterSpacing: 1.8,
                lineBreak: false,
            },
        );

    doc
        .font("Times-BoldItalic")
        .fontSize(15)
        .fillColor(COLORS.white)
        .text(
            data.stub.heading,
            stubInnerX + 10,
            stubInnerY + 38,
            {
                width: stubInnerWidth - 20,
                align: "center",
                lineBreak: false,
            },
        );

    const qrDataUrl = await QRCode.toDataURL(
        data.qrValue,
        {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 200,
            color: {
                dark: "#17192FFF",
                light: "#F3EBDDFF",
            },
        },
    );

    const qrBuffer = Buffer.from(
        qrDataUrl.split(",")[1]!,
        "base64",
    );

    const qrSize = 88;
    const qrX = stubCenter - qrSize / 2;
    const qrY = stubInnerY + 76;

    doc
        .fillColor(COLORS.paper)
        .rect(
            qrX - 6,
            qrY - 6,
            qrSize + 12,
            qrSize + 12,
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

    const stubMetaY = qrY + qrSize + 16;

    doc
        .font("Courier")
        .fontSize(5.5)
        .fillColor(COLORS.white)
        .text(
            `${data.stub.gate} · Sect. ${data.stub.section}`,
            stubInnerX + 10,
            stubMetaY,
            {
                width: stubInnerWidth - 20,
                align: "center",
                lineBreak: false,
            },
        );

    doc
        .font("Times-BoldItalic")
        .fontSize(9.5)
        .text(
            data.stub.dates,
            stubInnerX + 10,
            stubMetaY + 16,
            {
                width: stubInnerWidth - 20,
                align: "center",
                lineBreak: false,
            },
        );

    const stubBottomY = stubInnerY + stubInnerHeight - 32;

    doc
        .moveTo(
            stubInnerX + 18,
            stubBottomY - 10,
        )
        .lineTo(
            stubInnerX + stubInnerWidth - 18,
            stubBottomY - 10,
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
            stubInnerX + 10,
            stubBottomY,
            {
                width: stubInnerWidth - 20,
                align: "center",
                characterSpacing: 1,
                lineBreak: false,
            },
        );

    const footerY = ticketY + contentHeight + 11;

    doc
        .font("Courier")
        .fontSize(5.5)
        .fillColor(COLORS.muted)
        .text(
            `SCAN AT ${data.entry.gate.toUpperCase()} • KEEP TICKET INTACT`,
            ticketX + 20,
            footerY,
            {
                width: 220,
                characterSpacing: 1.1,
                lineBreak: false,
            },
        );

    doc.text(
        data.website.toUpperCase(),
        ticketX + 250,
        footerY,
        {
            width: 170,
            align: "center",
            characterSpacing: 1.1,
            lineBreak: false,
        },
    );

    doc.text(
        `PRINTED ${data.printDate}`,
        stubX + 8,
        footerY,
        {
            width: stubWidth - 16,
            align: "right",
            characterSpacing: 1.1,
            lineBreak: false,
        },
    );

    doc.end();

    return output;
}
