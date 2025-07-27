export interface Property {
    id: string;
    name: string;
    description?: string;
    type: string;
    isRequired: boolean;
    isReadOnly: boolean;
    defaultValue?: string;
    createdAtUtc: Date;
    updatedAtUtc: Date;
}
