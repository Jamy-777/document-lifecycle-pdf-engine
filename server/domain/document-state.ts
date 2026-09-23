export const DOCUMENT_STATES = [
    "DRAFT",
    "SENT",
    "SIGNED",
    "VOIDED",
] as const;

export type DocumentState =
    (typeof DOCUMENT_STATES)[number];

export const ALLOWED_TRANSITIONS: Record<
    DocumentState,
    readonly DocumentState[]
> = {
    DRAFT: ["SENT", "VOIDED"],
    SENT: ["SIGNED", "VOIDED"],
    SIGNED: [],
    VOIDED: [],
};

export function canTransition(
    from: DocumentState,
    to: DocumentState,
): boolean {
    return ALLOWED_TRANSITIONS[from].includes(to);
}