export class InvalidStateTransitionError extends Error {
    constructor(
        public readonly from: string,
        public readonly to: string,
    ) {
        super(
            `Invalid document state transition: ${from} -> ${to}`,
        );

        this.name = "InvalidStateTransitionError";
    }
}