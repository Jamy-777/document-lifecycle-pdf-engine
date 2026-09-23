import type { ZodType } from "zod";

export interface DocumentTemplate<TData = unknown> {
    id: string;

    name: string;

    schema: ZodType<TData>;

    defaultData: TData;

    transformInput?: (
        input: unknown,
    ) => unknown;
}