import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { AgGridAngular } from 'ag-grid-angular';
import type { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { debounceTime } from 'rxjs';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';
import { UsuarioFormulario } from './usuario-formulario';

@Component({
  selector: 'app-usuarios-listado',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    AgGridAngular,
  ],
  templateUrl: './usuarios-listado.html',
  styleUrl: './usuarios-listado.scss',
})
export class UsuariosListado implements OnInit {
  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  textoFiltro = '';
  controlBusqueda = new FormControl('');

  columnas: ColDef<Usuario>[] = [
    { headerName: 'Usuario', field: 'nombreUsuario', filter: 'agTextColumnFilter', minWidth: 150 },
    { headerName: 'Nombre completo', field: 'nombreCompleto', filter: 'agTextColumnFilter', flex: 1, minWidth: 220 },
    { headerName: 'Rol', field: 'rol', filter: 'agTextColumnFilter', minWidth: 110 },
    {
      headerName: 'Estado',
      field: 'activo',
      filter: 'agTextColumnFilter',
      minWidth: 120,
      cellRenderer: (p: { value: boolean }) =>
        p.value
          ? '<span class="chip-estado chip-activo">Activo</span>'
          : '<span class="chip-estado chip-inactivo">Inactivo</span>',
    },
    {
      headerName: 'Acciones',
      colId: 'acciones',
      sortable: false,
      filter: false,
      minWidth: 110,
      cellRenderer: () =>
        '<button type="button" class="celda-accion-boton" aria-label="Editar usuario"><span class="material-symbols-outlined">edit</span></button>',
    },
  ];

  configuracionPorDefecto: ColDef = {
    sortable: true,
    resizable: true,
    floatingFilter: true,
  };

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();

    this.controlBusqueda.valueChanges.pipe(debounceTime(300)).subscribe((valor) => {
      this.textoFiltro = valor ?? '';
    });
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuarioService.listar(1, 1000).subscribe({
      next: (resultado) => {
        this.usuarios.set(resultado.items);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onGridReady(_evento: GridReadyEvent): void {}

  onCeldaClick(evento: CellClickedEvent<Usuario>): void {
    if (evento.column.getColId() === 'acciones' && evento.data) {
      this.abrirFormularioEditar(evento.data);
    }
  }

  abrirFormularioCrear(): void {
    const referencia = this.dialog.open(UsuarioFormulario, { width: '480px' });
    referencia.afterClosed().subscribe((seGuardo) => {
      if (seGuardo) {
        this.cargarUsuarios();
      }
    });
  }

  abrirFormularioEditar(usuario: Usuario): void {
    const referencia = this.dialog.open(UsuarioFormulario, { width: '480px', data: usuario });
    referencia.afterClosed().subscribe((seGuardo) => {
      if (seGuardo) {
        this.cargarUsuarios();
      }
    });
  }
}
