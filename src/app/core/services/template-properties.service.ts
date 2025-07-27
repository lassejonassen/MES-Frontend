import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Property } from '../../shared/models/property.model';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TemplatePropertiesService {
    private http = inject(HttpClient);
    private readonly apiUrl = 'http://localhost:5271/TemplateProperties';
    private properties = new BehaviorSubject<Property[]>([]);
    readonly properties$ = this.properties.asObservable();

    getProperties(templateId: string) {
        return this.http.get<Property[]>(`${this.apiUrl}/${templateId}`).pipe(
            tap((x) => {
                this.properties.next(x);
            })
        );
    }
}
