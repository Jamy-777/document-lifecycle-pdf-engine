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

export class TemplateNotFoundError extends Error {
    constructor(
        public readonly templateId: string,
    ) {
        super(
            `Template "${templateId}" is not registered`,
        );

        this.name = "TemplateNotFoundError";
    }
}

export class TemplateDataValidationError extends Error {
    constructor(
        public readonly templateId: string,
        public readonly issues: unknown,
    ) {
        super(
            `Data for template "${templateId}" is invalid`,
        );

        this.name = "TemplateDataValidationError";
    }
}