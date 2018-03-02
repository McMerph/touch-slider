import CLASS_NAMES from "./ClassNames";
import "./index.css";

interface ISettings {
    boundaryResistanceReduction: number;
    deltaThreshold: number;
    maxDelta: number;
    timeThresholdInMs: number;
}

enum State { Idle, TouchStarted, Swipe, SlideToPrevious, SlideToNext,}

export default class Slider {

    private static defaultSettings: ISettings = {
        boundaryResistanceReduction: 5,
        deltaThreshold: 50,
        maxDelta: 95,
        timeThresholdInMs: 300,
    };

    private readonly container: Element;
    private readonly settings: ISettings;

    private leftSlide: HTMLElement | undefined;
    private centerSlide: HTMLElement | undefined;
    private rightSlide: HTMLElement | undefined;
    private startTouch: Touch;

    private state: State = State.Idle;
    private startTime: number;

    public constructor(container: HTMLElement, settings?: Partial<ISettings>) {
        this.container = container;
        this.settings = {...Slider.defaultSettings, ...settings};

        this.addEventListeners();
        this.container.classList.add(CLASS_NAMES.BLOCK);
        this.initializeSlides();
    }

    public appendSlide(slide: HTMLElement): void {
        slide.classList.add(
            CLASS_NAMES.ELEMENTS.SLIDE.NAME,
            CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.HIDDEN,
        );
        this.container.appendChild(slide);
        this.initializeSlides();
    }

    public updateClassNames(): void {
        for (let i = 0; i < this.container.children.length; i++) {
            const child: Element = this.container.children.item(i);
            child.classList.add(CLASS_NAMES.ELEMENTS.SLIDE.NAME);
            if (child !== this.leftSlide && child !== this.centerSlide && child !== this.rightSlide) {
                child.classList.add(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.HIDDEN);
            }
        }
    }

    public previous(): void {
        this.slideTo(100);
    }

    public next(): void {
        this.slideTo(-100);
    }

    private addEventListeners(): void {
        this.container.addEventListener("touchstart", (event) => {
            if (event.touches.length === 1 && this.state !== State.Swipe) {
                this.startTouch = event.changedTouches[0];
                this.state = State.TouchStarted;
            }
            this.startTime = performance.now();
        });

        this.container.addEventListener("touchmove", (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                if (this.state === State.TouchStarted) {
                    if (this.isHorizontalSwipe(event.changedTouches[0])) {
                        this.state = State.Swipe;
                    }
                } else if (this.state === State.Swipe) {
                    this.setTranslate(this.getDelta(event.changedTouches[0]));
                }
            }
        });

        const handleTouchEnd: (event: TouchEvent) => void = (event) => {
            if (this.state === State.Swipe) {
                event.preventDefault();
                this.slideTo(this.getDelta(event.changedTouches[0]));
            }
        };
        this.container.addEventListener("touchend", handleTouchEnd);
        this.container.addEventListener("touchcancel", handleTouchEnd);

        this.container.addEventListener("transitionend", () => {
            this.getSlides().forEach((slide) =>
                slide.classList.remove(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.ANIMATING));
            if (this.state === State.SlideToPrevious) {
                this.centerSlide = this.leftSlide;
            }
            if (this.state === State.SlideToNext) {
                this.centerSlide = this.rightSlide;
            }
            this.resetSlides();
            this.state = State.Idle;
        });
    }

    /**
     * If horizontal offset greater than vertical then it is swipe
     * @param {Touch} touch - touch to check
     */
    private isHorizontalSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) >=
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    private getDelta(touch: Touch): number {
        let delta: number = touch.pageX - this.startTouch.pageX;
        if ((delta > 0 && !this.leftSlide) || (delta < 0 && !this.rightSlide)) {
            delta = delta / this.settings.boundaryResistanceReduction;
        }
        delta = delta / this.container.clientWidth * 100;
        delta = Math.min(delta, this.settings.maxDelta);
        delta = Math.max(delta, -this.settings.maxDelta);

        return delta;
    }

    private initializeSlides() {
        this.centerSlide = this.container.firstElementChild ?
            (this.container.firstElementChild as HTMLElement) : undefined;
        if (this.centerSlide) {
            this.centerSlide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.CURRENT);
        }
        this.updateClassNames();
        if (this.centerSlide) {
            this.resetSlides();
        }
    }

    private resetSlides(): void {
        if (this.container.children.length > 0) {
            for (let i = 0; i < this.container.children.length; i++) {
                this.removeSlideFromNavigation((this.container.children.item(i)) as HTMLElement);
            }
            if (this.centerSlide) {
                this.leftSlide = this.centerSlide.previousElementSibling ?
                    (this.centerSlide.previousElementSibling as HTMLElement) : undefined;
                this.rightSlide = this.centerSlide.nextElementSibling ?
                    (this.centerSlide.nextElementSibling as HTMLElement) : undefined;
            }
            this.initializeSlide(this.centerSlide, CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.CURRENT);
            this.initializeSlide(this.leftSlide, CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.LEFT);
            this.initializeSlide(this.rightSlide, CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.RIGHT);
        }
    }

    private removeSlideFromNavigation(slide: HTMLElement): void {
        slide.classList.remove(
            CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.LEFT,
            CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.CURRENT,
            CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.RIGHT,
        );
        slide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.HIDDEN);
        slide.style.transform = null;
    }

    private initializeSlide(slide: HTMLElement | undefined, className: string): void {
        if (slide) {
            slide.classList.add(className);
            slide.classList.remove(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.HIDDEN);
            slide.style.transform = null;
        }
    }

    private getSlides(): HTMLElement[] {
        return [this.leftSlide, this.centerSlide, this.rightSlide]
            .filter((slide) => slide) as HTMLElement[];
    }

    private slideTo(delta: number): void {
        this.getSlides().forEach((slide) =>
            slide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.ANIMATING));
        const excessDeltaThreshold: boolean = Math.abs(delta) > this.settings.deltaThreshold;
        const excessTimeThreshold: boolean = performance.now() - this.startTime < this.settings.timeThresholdInMs;
        const shouldSlide: boolean = excessDeltaThreshold || excessTimeThreshold;
        if (shouldSlide && delta < 0 && this.rightSlide) {
            this.setTranslate(-100);
            this.state = State.SlideToNext;
        } else if (shouldSlide && delta > 0 && this.leftSlide) {
            this.setTranslate(100);
            this.state = State.SlideToPrevious;
        } else {
            this.setTranslate(0);
        }
    }

    private setTranslate(delta: number): void {
        this.setSlideTranslate(this.leftSlide, delta - 100);
        this.setSlideTranslate(this.centerSlide, delta);
        this.setSlideTranslate(this.rightSlide, delta + 100);
    }

    private setSlideTranslate(slide: HTMLElement | undefined, percentage: number): void {
        if (slide) {
            slide.style.transform = `translate3d(${percentage}%, 0, 0`;
        }
    }

}
