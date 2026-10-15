import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MODULO_META } from '../../core/models/documento.model';
import { NewsService } from '../../core/services/news.service';
import { ArchivosStore } from '../../core/store/archivos.store';
import { ContenidoStore } from '../../core/store/contenido.store';
import { DocumentosStore } from '../../core/store/documentos.store';
import { FacultyStore } from '../../core/store/faculty.store';
import { DialogComponent } from '../../shared/ui';
import { ToastService } from '../shared/toast/toast';

@Component({
  selector: 'app-admin-contenido',
  standalone: true,
  imports: [RouterLink, DialogComponent],
  template: `
    <div class="admin-page">
      <header class="page-header">
        <div class="portal-header-identity">
          <span class="portal-title-icon" aria-hidden="true"><i class="fa-solid fa-layer-group"></i></span>
          <div class="portal-header-copy">
            <h1 class="page-title">Contenido del portal</h1>
            <p class="page-sub">
            Administra las páginas, documentos y secciones visibles en el portal institucional.
          </p>
          </div>
        </div>
        <button type="button" class="btn-ghost" (click)="confirmar.set(true)">
          Restaurar todo
        </button>
      </header>

      <div class="modulo-grid" aria-label="Módulos del portal público">
        @for (mod of filas(); track mod.id) {
          <a class="admin-card modulo-tile" [routerLink]="mod.adminPath" [attr.aria-label]="'Editar ' + mod.titulo">
            <div>
              <i class="fa {{ mod.icon }}" aria-hidden="true"></i>
              <h2 class="page-title" style="font-size:1.05rem;margin-top:8px">{{ mod.titulo }}</h2>
            </div>
            <div class="stat-row">
              @if (mod.modificado) {
                <span class="badge badge-modificado">Modificado</span>
              }
              <span>{{ mod.publicados }} publicados</span>
              <span>{{ mod.borradores }} en borrador</span>
            </div>
          </a>
        }
      </div>
    </div>

    <app-dialog
      [open]="confirmar()"
      title="Restaurar todo el contenido"
      (openChange)="confirmar.set($event)"
    >
      @if (remoto) {
        <p>
          Los módulos de contenido y sus documentos vuelven al contenido oficial en el servidor,
          para todos los visitantes. Es inmediato y no se puede deshacer.
        </p>
        <p class="form-hint">
          Las noticias, el directorio de personal y el repositorio no se tocan: se gestionan en su
          propia pantalla.
        </p>
      } @else {
        <p>
          Se borran los cambios de los módulos de contenido, el directorio, las noticias, los
          documentos subidos y los archivos de este navegador. El portal vuelve a las constantes
          originales.
        </p>
      }
      <div dialog-footer>
        <button type="button" class="btn-cancel" (click)="confirmar.set(false)">Cancelar</button>
        <button
          type="button"
          class="btn-danger"
          [disabled]="restaurando()"
          (click)="restaurarTodo()"
        >
          {{ restaurando() ? 'Restaurando…' : 'Restaurar todo' }}
        </button>
      </div>
    </app-dialog>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .admin-page { display: flex; flex-direction: column; gap: 22px; }
    .page-header {
      padding: 18px 24px; border: 1px solid #f1dfd2;
      border-radius: 16px; background: linear-gradient(115deg, #fff8f2, #fff 70%);
    }
    .page-header { align-items: center; padding: 18px 24px; border-radius: 18px; }
    .portal-header-identity { display: flex; align-items: flex-start; gap: 12px; flex: 1 1 auto; min-width: 0; }
    .portal-header-copy { min-width: 0; }
    .portal-title-icon { display: inline-flex; flex: 0 0 38px; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 13px; background: #fff0e4; color: var(--adm-brand); font-size: .96rem; }
    .portal-header-copy .page-title { margin: 0 0 3px; line-height: 1.25; }
    .portal-header-copy .page-sub { margin: 0; }
    @media (max-width: 600px) { .portal-header-identity { gap: 11px; } .portal-title-icon { flex-basis: 38px; width: 38px; height: 38px; } }
    .page-header .page-title { font-size: clamp(1.4rem, 2vw, 1.75rem); }
    .page-header .page-sub { font-size: .85rem; }
    @media (max-width: 720px) { .page-header { padding: 20px; } }
    .page-header .page-sub { max-width: 68ch; line-height: 1.6; }
    .modulo-grid { gap: 18px; }
    .modulo-tile {
      position: relative; min-height: 175px; padding: 24px;
      border-radius: 16px; background: #fff;
      border: 1px solid var(--adm-line);
      box-shadow: 0 3px 14px rgba(27, 41, 61, .035);
    }
    .modulo-tile > div:first-child > i {
      display: inline-flex; width: 46px; height: 46px;
      align-items: center; justify-content: center;
      border-radius: 13px; background: #fff0e4;
      color: var(--adm-brand); font-size: 1.2rem;
    }
    .modulo-tile .stat-row {
      flex-wrap: wrap; margin-top: auto; padding-top: 14px;
      border-top: 1px solid var(--adm-line);
    }
    .modulo-tile:hover { border-color: #f0b98f; }
    .modulo-tile:focus-visible { outline: 3px solid var(--adm-brand); outline-offset: 3px; }
    .modulo-tile .stat-row { align-items: center; gap: 8px 12px; line-height: 1.5; }
    .modulo-tile .page-title { overflow-wrap: anywhere; }
    @media (prefers-reduced-motion: reduce) { .modulo-tile { transition: none; } }
    @media (max-width: 720px) {
      .page-header { padding: 18px; }
      .modulo-tile { min-height: 150px; padding: 20px; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContenido {
  private readonly contenido = inject(ContenidoStore);
  private readonly documentos = inject(DocumentosStore);
  private readonly archivos = inject(ArchivosStore);
  private readonly personal = inject(FacultyStore);
  private readonly noticias = inject(NewsService);
  private readonly toast = inject(ToastService);

  readonly confirmar = signal(false);
  readonly remoto = environment.useRemoteApi;
  readonly restaurando = signal(false);

  readonly filas = computed(() =>
    MODULO_META.map((mod) => {
      const conteo = this.documentos.conteo(mod.id);
      return {
        ...mod,
        modificado: this.contenido.de(mod.id).modificado(),
        publicados: conteo.publicados,
        borradores: conteo.borradores,
      };
    }),
  );

  /**
   * Con backend, restaurar significa pedirle al servidor que reponga el copy y
   * los documentos oficiales: limpiar el navegador dejaría el cambio vivo para
   * el resto del mundo. Sin backend se limpia el almacenamiento local.
   */
  async restaurarTodo(): Promise<void> {
    this.restaurando.set(true);
    try {
      await this.contenido.resetAll();
      if (this.remoto) {
        for (const mod of MODULO_META) {
          await this.documentos.restaurarModulo(mod.id);
        }
      } else {
        this.personal.reset();
        this.noticias.reset();
        await this.documentos.reset();
        await this.archivos.vaciar();
      }
      this.confirmar.set(false);
      this.toast.success('El portal volvió al contenido original.');
    } catch {
      this.toast.error('No se pudo restaurar todo el contenido.');
    } finally {
      this.restaurando.set(false);
    }
  }
}
