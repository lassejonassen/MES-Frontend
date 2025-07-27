import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PropertyType } from '../../enumns/property-type.enum';
import { InstanceProperty } from '../../models/instance-property.model';
import { Property } from '../../models/property.model';

@Component({
    selector: 'app-property-value',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './property-value.component.html',
    styleUrl: './property-value.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertyValueComponent {
    property = input.required<InstanceProperty | Property>();
    showDefaultValue = computed(() => !this.isProperty);
    PropertyType = PropertyType;
    booleanValue = computed(() => {
        const value = this.getStringValue(this.property());
        return value?.toLowerCase() === 'true';
    });
    numericValue = computed(() => {
        const value = this.getStringValue(this.property());
        return (value?.length ?? 0) > 0 ? +value! : null;
    });
    stringValue = computed(() => {
        return this.getStringValue(this.property());
    });
    descriptionValue = computed(() => {
        return this.getDescriptionValue(this.property());
    });
    missingRequiredValue = computed(() => {
        return !this.showDefaultValue() && this.property().isRequired && !this.getStringValue(this.property());
    });

    private get isProperty(): boolean {
        return 'instanceId' in this.property();
    }

    private getStringValue(property: InstanceProperty | Property): string | undefined {
        // Determine if it is an InstanceProperty or a Property
        if (this.isProperty) {
            return (property as unknown as InstanceProperty).valueString;
        } else {
            return (property as unknown as Property).defaultValue;
        }
    }

    private getDescriptionValue(property: InstanceProperty | Property): string | undefined {
        // Determine if it is an InstanceProperty or a Property
        if (this.isProperty) {
            return (property as unknown as InstanceProperty).valueDescription;
        } else {
            return undefined;
        }
    }
}
