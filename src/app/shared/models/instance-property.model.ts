export interface InstanceProperty {
    id: string;
    instanceId: string;
    templatePropertyId: string;
    valueNumeric?: number;
    valueString?: string;
    valueBoolean?: string;
    valueDescription?: string;
    // hasMentions: boolean;
    // propertyMentions: Mention[];
    name: string;
    type: string;
    isRequired: boolean;
    isReadOnly: boolean;
    createdAtUtc: Date;
    updatedAtUtc: Date;
}
