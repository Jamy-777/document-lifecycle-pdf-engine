export function transformJazzFestivalTicketInput(
    input: unknown,
): unknown {
    if (
        typeof input !== "object" ||
        input === null ||
        Array.isArray(input)
    ) {
        return input;
    }

    const data = {
        ...(input as Record<string, unknown>),
    };

    if (typeof data.venue === "string") {
        data.venue = {
            name: data.venue,
        };
    }

    return data;
}