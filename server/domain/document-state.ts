export const DOCUMENT_STATES = [
    "DRAFT",
    "SENT",
    "SIGNED",
    "VOIDED",
] as const;

export type DocumentState =
    (typeof DOCUMENT_STATES)[number];