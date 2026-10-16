import { Injectable, signal } from '@angular/core';

export type PaletaInstitucional = 'rojo' | 'azul' | 'dorado';

export interface PaletaDetalle {
  id: PaletaInstitucional;
  nombre: string;
  descripcion: string;
  principal: string;
  secundario: string;
  suave: string;
}

export const PALETAS_INSTITUCIONALES: readonly PaletaDetalle[] = [
  { id: 'rojo', nombre: 'Rojo institucional', descripcion: 'Rojo del estandarte y azul oscuro', principal: '#b91c2b', secundario: '#292d3b', suave: '#fce9ec' },
  { id: 'azul', nombre: 'Azul institucional', descripcion: 'Azul oscuro con detalles claros', principal: '#24476b', secundario: '#192e45', suave: '#eaf1f8' },
  { id: 'dorado', nombre: 'Dorado institucional', descripcion: 'Dorado del estandarte y azul oscuro', principal: '#91630d', secundario: '#292d3b', suave: '#fff4dc' },
] as const;

const STORAGE_KEY = 'pc-admin-paleta-v1';

@Injectable({ providedIn: 'root' })
export class AdminPaletaService {
  readonly actual = signal<PaletaInstitucional>('rojo');

  constructor() {
    try {
      const guardada = localStorage.getItem(STORAGE_KEY);
      if (guardada === 'rojo' || guardada === 'azul' || guardada === 'dorado') {
        this.actual.set(guardada);
      }
    } catch {
      // En SSR o navegadores con almacenamiento bloqueado se usa rojo.
    }
  }

  guardar(paleta: PaletaInstitucional): void {
    this.actual.set(paleta);
    try {
      localStorage.setItem(STORAGE_KEY, paleta);
    } catch {
      // El tema sigue activo durante esta sesión aunque no se pueda persistir.
    }
  }
}
