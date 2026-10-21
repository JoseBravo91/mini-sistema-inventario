import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  constructor(iconRegistry: MatIconRegistry) {
    // Usa Material Symbols Outlined (icono moderno de trazo fino) en vez de Material Icons clasico
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}
