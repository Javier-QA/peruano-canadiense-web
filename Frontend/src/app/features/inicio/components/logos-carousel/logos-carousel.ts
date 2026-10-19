import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { ContenidoStore } from '../../../../core/store/contenido.store';

@Component({
  selector: 'app-inicio-logos-carousel',
  standalone: true,
  imports: [],
  templateUrl: './logos-carousel.html',
  styleUrl: './logos-carousel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogosCarousel {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contenido = inject(ContenidoStore);
  private readonly carousel = viewChild<ElementRef<HTMLElement>>('carousel');
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  readonly items = computed(() => this.contenido.inicio.value().logos);

  // Los logotipos institucionales se sirven desde assets locales del portal.
  // Evita referencias obsoletas del contenido almacenado sin alterar los enlaces.
  logoSrc(image: string, alt: string): string {
    const known: Record<string, string> = {
      'Ministerio de Educación': 'logo_minedu.png',
      'DIFOID — Educación Superior Pedagógica': 'logo_difoid.png',
      'Sistema de Información Académica': 'logo_sia.png',
      'Biblioteca Nacional del Perú': 'logo_bnp.png',
      'PerúEduca': 'logo perueduca.jpg',
      'Microsoft 365': 'logo_M365.png',
    };
    const filename = known[alt];
    return filename ? '/assets/' + encodeURIComponent(filename) : image;
  }

  onLogoError(event: Event, alt: string): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['fallbackTried'] === 'true') {
      img.style.display = 'none';
      return;
    }
    img.dataset['fallbackTried'] = 'true';
    const known: Record<string, string> = {
      'Ministerio de Educación': 'logo_minedu.png',
      'DIFOID — Educación Superior Pedagógica': 'logo_difoid.png',
      'Sistema de Información Académica': 'logo_sia.png',
      'Biblioteca Nacional del Perú': 'logo_bnp.png',
      'PerúEduca': 'logo perueduca.jpg',
      'Microsoft 365': 'logo_M365.png',
    };
    const filename = known[alt];
    if (filename) {
      img.src = '/images/pcanadiense/' + encodeURIComponent(filename);
    } else {
      img.style.display = 'none';
    }
  }

  private animationId: number | null = null;
  private isPaused = false;
  private isDragging = false;
  private didDrag = false;
  private scrollSpeed = 0.5;
  private currentTranslate = 0;
  private startX = 0;
  private dragStartTranslate = 0;
  private listeners: Array<() => void> = [];

  constructor() {
    afterNextRender(() => {
      this.cloneItems();
      this.ngZone.runOutsideAngular(() => {
        this.startAutoScroll();
        this.bindEvents();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.listeners.forEach((off) => off());
      this.listeners = [];
      if (this.animationId !== null) {
        cancelAnimationFrame(this.animationId);
      }
    });
  }

  private cloneItems(): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) return;
    const origItems = Array.from(trackEl.children) as HTMLElement[];
    origItems.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      trackEl.appendChild(clone);
    });
  }

  private startAutoScroll(): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const tick = () => {
      if (
        !this.isPaused &&
        !this.isDragging &&
        !document.body.classList.contains('ae-stop-animation')
      ) {
        this.currentTranslate -= this.scrollSpeed;
        const halfWidth = trackEl.scrollWidth / 2;
        if (halfWidth > 0 && Math.abs(this.currentTranslate) >= halfWidth) {
          this.currentTranslate = 0;
        }
        trackEl.style.transform = `translateX(${this.currentTranslate}px)`;
      }
      this.animationId = requestAnimationFrame(tick);
    };

    this.animationId = requestAnimationFrame(tick);
  }

  private bindEvents(): void {
    const carouselEl = this.carousel()?.nativeElement;
    const trackEl = this.track()?.nativeElement;
    if (!carouselEl || !trackEl) return;

    const on = (
      target: EventTarget,
      type: string,
      handler: EventListener,
      options?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, handler, options);
      this.listeners.push(() => target.removeEventListener(type, handler, options));
    };

    on(carouselEl, 'mouseenter', () => {
      this.isPaused = true;
    });
    on(carouselEl, 'mouseleave', () => {
      this.isPaused = false;
      if (!this.isDragging) this.didDrag = false;
    });
    on(trackEl, 'mousedown', (e) => this.onDragStart(e as MouseEvent));
    on(window, 'mousemove', (e) => this.onDragMove(e as MouseEvent));
    on(window, 'mouseup', () => this.onDragEnd());
    on(trackEl, 'touchstart', (e) => this.onDragStart(e as TouchEvent), { passive: true });
    on(window, 'touchmove', (e) => this.onDragMove(e as TouchEvent), { passive: true });
    on(window, 'touchend', () => this.onDragEnd());
    on(trackEl, 'click', (e) => {
      if (this.didDrag) {
        e.preventDefault();
        this.didDrag = false;
      }
    });
  }

  private onDragStart(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    this.didDrag = false;
    this.startX = this.getClientX(event);
    this.dragStartTranslate = this.currentTranslate;
    const trackEl = this.track()?.nativeElement;
    if (trackEl) {
      trackEl.style.cursor = 'grabbing';
    }
  }

  private onDragMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;
    const diff = this.getClientX(event) - this.startX;
    if (Math.abs(diff) > 3) this.didDrag = true;
    this.currentTranslate = this.dragStartTranslate + diff;
    const trackEl = this.track()?.nativeElement;
    if (trackEl) {
      trackEl.style.transform = `translateX(${this.currentTranslate}px)`;
    }
  }

  private onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const trackEl = this.track()?.nativeElement;
    if (trackEl) {
      trackEl.style.cursor = 'grab';
    }
  }

  private getClientX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }
}

