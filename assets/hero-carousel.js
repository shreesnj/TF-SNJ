import { Component } from '@theme/component';

/**
 * @typedef {Object} HeroCarouselRefs
 * @property {HTMLElement} slidesContainer - The scrollable track
 * @property {HTMLElement[]} slide - Each slide element
 */

/** @extends {Component<HeroCarouselRefs>} */
class HeroCarousel extends Component {
  /** @type {number} */
  #activeIndex = 0;

  /** @type {IntersectionObserver | null} */
  #observer = null;

  /** @type {number | null} */
  #autoplayInterval = null;

  connectedCallback() {
    super.connectedCallback();
    this.#setupObserver();
    this.#setupAutoplay();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }

    this.#clearAutoplay();
  }

  #setupObserver() {
    const slides = this.#getSlides();

    if (slides.length === 0) return;

    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = slides.indexOf(/** @type {HTMLElement} */ (entry.target));

            if (index !== -1) {
              this.#activeIndex = index;
              this.setAttribute('data-active-slide', String(index));
            }
          }
        }
      },
      {
        root: this.refs.slidesContainer,
        threshold: 0.5,
      }
    );

    for (const slide of slides) {
      this.#observer.observe(slide);
    }
  }

  #setupAutoplay() {
    if (!this.hasAttribute('autoplay')) return;

    const speed = parseInt(this.getAttribute('autoplay-speed') || '5', 10) * 1000;

    this.#autoplayInterval = window.setInterval(() => {
      this.#advance(1);
    }, speed);

    this.addEventListener('mouseenter', this.#pauseAutoplay);
    this.addEventListener('mouseleave', this.#resumeAutoplay);
    this.addEventListener('focusin', this.#pauseAutoplay);
    this.addEventListener('focusout', this.#resumeAutoplay);
    this.addEventListener('touchstart', this.#pauseAutoplay, { passive: true });
    this.addEventListener('touchend', this.#resumeAutoplay);
  }

  #pauseAutoplay = () => {
    this.#clearAutoplay();
  };

  #resumeAutoplay = () => {
    if (!this.hasAttribute('autoplay')) return;

    this.#clearAutoplay();

    const speed = parseInt(this.getAttribute('autoplay-speed') || '5', 10) * 1000;

    this.#autoplayInterval = window.setInterval(() => {
      this.#advance(1);
    }, speed);
  };

  #clearAutoplay() {
    if (this.#autoplayInterval !== null) {
      clearInterval(this.#autoplayInterval);
      this.#autoplayInterval = null;
    }
  }

  /** @returns {HTMLElement[]} */
  #getSlides() {
    if (Array.isArray(this.refs.slide)) {
      return this.refs.slide;
    }

    if (this.refs.slide) {
      return [this.refs.slide];
    }

    return [];
  }

  /**
   * Advance slides by a given direction.
   * @param {number} direction - 1 for next, -1 for prev
   */
  #advance(direction) {
    const slides = this.#getSlides();
    const container = this.refs.slidesContainer;

    if (!container || slides.length === 0) return;

    let nextIndex = this.#activeIndex + direction;

    if (nextIndex >= slides.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = slides.length - 1;
    }

    const targetSlide = slides[nextIndex];

    if (targetSlide) {
      container.scrollTo({
        left: targetSlide.offsetLeft - container.offsetLeft,
        behavior: 'smooth',
      });
    }
  }

  /** Handler for next button click */
  next() {
    this.#advance(1);
  }

  /** Handler for prev button click */
  prev() {
    this.#advance(-1);
  }
}

customElements.define('hero-carousel-component', HeroCarousel);
