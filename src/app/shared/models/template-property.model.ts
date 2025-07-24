export interface TemplateProperty {
    id: string;
    templateId: string;
    name: string;
    type: string;
    description?: string;
    defaultValue?: string;
    isRequired: boolean;
    isReadOnly: boolean;
    createdAtUtc: string;
    updatedAtUtc: string;
}
