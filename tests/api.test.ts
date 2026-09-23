import {
    describe,
    expect,
    test,
} from "bun:test";

const BASE_URL =
    process.env.TEST_BASE_URL ??
    "http://localhost:3000";

async function createDocument() {
    const response = await fetch(
        `${BASE_URL}/api/documents`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify({
                templateId:
                    "jazz-festival-ticket",
                title:
                    "VIP Weekend Pass - Jazz Festival 2026",
                createdBy:
                    "organizer@riversidejazz.fest",
                data: {
                    series: "017",
                    ticketNumber:
                        `TEST-${crypto.randomUUID()}`,
                    venue:
                        "Willow Bend Riverfront Park",
                },
            }),
        },
    );

    expect(response.status).toBe(201);

    return response.json();
}

describe("Document lifecycle API", () => {
    test("creates a DRAFT document", async () => {
        const document =
            await createDocument();

        expect(
            document.state,
        ).toBe("DRAFT");

        expect(
            document.templateId,
        ).toBe(
            "jazz-festival-ticket",
        );
    });

    test("performs lifecycle transitions and records audit trail", async () => {
        const document =
            await createDocument();

        const id = document.id;

        const sent = await fetch(
            `${BASE_URL}/api/documents/${id}/transition`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    action: "SENT",
                    actor:
                        "boxoffice@riversidejazz.fest",
                    note:
                        "Issued ticket",
                }),
            },
        );

        expect(sent.status).toBe(200);

        const sentDocument =
            await sent.json();

        expect(
            sentDocument.state,
        ).toBe("SENT");

        const signed = await fetch(
            `${BASE_URL}/api/documents/${id}/transition`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    action: "SIGNED",
                    actor:
                        "attendee@example.com",
                }),
            },
        );

        expect(
            signed.status,
        ).toBe(200);

        const auditResponse =
            await fetch(
                `${BASE_URL}/api/documents/${id}/audit-trail`,
            );

        expect(
            auditResponse.status,
        ).toBe(200);

        const audit =
            await auditResponse.json();

        expect(audit).toHaveLength(2);

        expect(
            audit[0].previousState,
        ).toBe("DRAFT");

        expect(
            audit[0].nextState,
        ).toBe("SENT");

        expect(
            audit[1].previousState,
        ).toBe("SENT");

        expect(
            audit[1].nextState,
        ).toBe("SIGNED");
    });

    test("rejects illegal transitions", async () => {
        const document =
            await createDocument();

        const response =
            await fetch(
                `${BASE_URL}/api/documents/${document.id}/transition`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        action: "SIGNED",
                        actor:
                            "test@example.com",
                    }),
                },
            );

        expect(
            response.status,
        ).toBe(400);
    });

    test("generates downloadable PDF", async () => {
        const document =
            await createDocument();

        const response =
          await fetch(
            `${BASE_URL}/api/documents/${document.id}/pdf`,
          );

        expect(
            response.status,
        ).toBe(200);

        expect(
            response.headers.get(
                "content-type",
            ),
        ).toContain(
            "application/pdf",
        );

        expect(
            response.headers.get(
                "content-disposition",
            ),
        ).toContain(
            "attachment",
        );

        const pdf =
            new Uint8Array(
                await response.arrayBuffer(),
            );

        expect(
            pdf.length,
        ).toBeGreaterThan(1000);

        const signature =
            new TextDecoder().decode(
                pdf.slice(0, 5),
            );

        expect(signature).toBe(
            "%PDF-",
        );
    });

    test("rejects unknown templates", async () => {
        const response =
            await fetch(
                `${BASE_URL}/api/documents`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        templateId:
                            "does-not-exist",
                        title:
                            "Invalid Document",
                        createdBy:
                            "test@example.com",
                        data: {},
                    }),
                },
            );

        expect(
            response.status,
        ).toBe(400);
    });
});
