import CLASS_NAMES from "./ClassNames";
import "./index.css";

interface ISettings {
    boundaryResistanceReduction: number;
    deltaThreshold: number;
    maxDelta: number;
    timeThresholdInMs: number;
}

export default class Slider {

    private static defaultSettings: ISettings = {
        boundaryResistanceReduction: 5,
        deltaThreshold: 50,
        maxDelta: 95,
        timeThresholdInMs: 300,
    };

    private readonly element: Element;
    private readonly settings: ISettings;

    private leftSlide: HTMLElement | undefined;
    private centerSlide: HTMLElement | undefined;
    private rightSlide: HTMLElement | undefined;
    private startTouch: Touch;

    private swipeStarted: boolean = false;
    private swipeDetecting: boolean = false;
    private slideToLeftAnimation: boolean = false;
    private slideToRightAnimation: boolean = false;
    private startTime: number;

    public constructor(element: HTMLElement, settings?: Partial<ISettings>) {
        this.element = element;
        this.settings = {...Slider.defaultSettings, ...settings};

        this.addEventListeners();
        this.element.classList.add(CLASS_NAMES.BLOCK);
        this.initializeSlides();
    }

    public appendSlide(slide: HTMLElement): void {
        slide.classList.add(
            CLASS_NAMES.ELEMENTS.SLIDE.NAME,
            CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.HIDDEN,
        );
        this.element.appendChild(slide);
        this.initializeSlides();
    }

    public updateClassNames(): void {
        for (let i = 0; i < this.element.children.length; i++) {
            const child: Element = this.element.children.item(i);
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
        this.element.addEventListener("touchstart", (event) => {
            if (event.touches.length === 1 && !this.swipeStarted) {
                this.swipeDetecting = true;
                this.startTouch = event.changedTouches[0];
            }
            this.startTime = performance.now();
        });

        this.element.addEventListener("touchmove", (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                if (this.swipeDetecting) {
                    if (this.isHorizontalSwipe(event.changedTouches[0])) {
                        this.swipeStarted = true;
                    }
                    this.swipeDetecting = false;
                }
                if (this.swipeStarted) {
                    this.setTranslate(this.getDelta(event.changedTouches[0]));
                }
            }
        });

        const handleTouchEnd: (event: TouchEvent) => void = (event) => {
            if (this.swipeStarted) {
                event.preventDefault();
                this.slideTo(this.getDelta(event.changedTouches[0]));
            }
            this.swipeStarted = false;
        };
        this.element.addEventListener("touchend", handleTouchEnd);
        this.element.addEventListener("touchcancel", handleTouchEnd);

        this.element.addEventListener("transitionend", () => {
            this.getSlides().forEach((slide) =>
                slide.classList.remove(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.ANIMATING));
            if (this.slideToLeftAnimation) {
                this.centerSlide = this.leftSlide;
                this.slideToLeftAnimation = false;
            }
            if (this.slideToRightAnimation) {
                this.centerSlide = this.rightSlide;
                this.slideToRightAnimation = false;
            }
            this.resetNavigationInAccordanceWithCurrentSlide();
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
        delta = delta / this.element.clientWidth * 100;
        delta = delta > this.settings.maxDelta ? this.settings.maxDelta : delta;
        delta = delta < -this.settings.maxDelta ? -this.settings.maxDelta : delta;

        return delta;
    }

    private initializeSlides() {
        this.centerSlide = this.element.firstElementChild ?
            (this.element.firstElementChild as HTMLElement) : undefined;
        if (this.centerSlide) {
            this.centerSlide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.CURRENT);
        }
        this.updateClassNames();
        if (this.centerSlide) {
            this.resetNavigationInAccordanceWithCurrentSlide();
        }
    }

    private resetNavigationInAccordanceWithCurrentSlide(): void {
        if (this.element.children.length > 0) {
            for (let i = 0; i < this.element.children.length; i++) {
                this.removeSlideFromNavigation((this.element.children.item(i)) as HTMLElement);
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
            this.slideToRightAnimation = true;
        } else if (shouldSlide && delta > 0 && this.leftSlide) {
            this.setTranslate(100);
            this.slideToLeftAnimation = true;
        } else {
            this.setTranslate(0);
        }
    }

    private setTranslate(delta: number): void {
        if (this.leftSlide) {
            this.leftSlide.style.transform = `translate3d(${delta - 100}%, 0, 0`;
        }
        if (this.centerSlide) {
            this.centerSlide.style.transform = `translate3d(${delta}%, 0, 0`;
        }
        if (this.rightSlide) {
            this.rightSlide.style.transform = `translate3d(${delta + 100}%, 0, 0`;
        }
    }

}
