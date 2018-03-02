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

    private startTouch: Touch;
    private swipeStarted: boolean = false;
    private swipeDetecting: boolean = false;

    private leftSlide: HTMLElement | undefined;

    // TODO | undefined
    private centerSlide: HTMLElement;

    private rightSlide: HTMLElement | undefined;
    private slideToLeftAnimation: boolean = false;
    private slideToRightAnimation: boolean = false;
    private startTime: number;

    public constructor(element: HTMLElement, settings?: Partial<ISettings>) {
        this.element = element;
        this.settings = {...Slider.defaultSettings, ...settings};
        this.bind();

        this.initializeEventListeners();
        this.centerSlide = (this.element.firstElementChild as HTMLElement);
        if (this.element.children.length > 0) {
            this.initializeClassNames();
            this.resetNavigationInAccordanceWithCurrentSlide();
        }
    }

    public manualSlideToLeft(): void {
        this.slideTo(100);
    }

    public manualSlideToRight(): void {
        this.slideTo(-100);
    }

    private bind() {
        this.isHorizontalSwipe = this.isHorizontalSwipe.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    }

    private initializeEventListeners() {
        this.element.addEventListener("touchstart", this.handleTouchStart);
        this.element.addEventListener("touchmove", this.handleTouchMove);
        this.element.addEventListener("touchend", this.handleTouchEnd);
        this.element.addEventListener("touchcancel", this.handleTouchEnd);
        this.element.addEventListener("transitionend", this.handleTransitionEnd);
    }

    private initializeClassNames() {
        this.element.classList.add(CLASS_NAMES.BLOCK);
        for (let i = 0; i < this.element.children.length; i++) {
            this.element.children[i].classList.add(
                CLASS_NAMES.ELEMENTS.SLIDE.NAME,
                CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.HIDDEN,
            );
        }
        this.centerSlide.classList.add(
            CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.CURRENT,
        );
    }

    private resetNavigationInAccordanceWithCurrentSlide(): void {
        for (let i = 0; i < this.element.children.length; i++) {
            this.removeSlideFromNavigation((this.element.children[i]) as HTMLElement);
        }
        this.leftSlide = this.centerSlide.previousElementSibling ?
            (this.centerSlide.previousElementSibling as HTMLElement) : undefined;
        this.rightSlide = this.centerSlide.nextElementSibling ?
            (this.centerSlide.nextElementSibling as HTMLElement) : undefined;
        this.initializeSlide(this.centerSlide, CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.CURRENT);
        this.initializeSlide(this.leftSlide, CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.LEFT);
        this.initializeSlide(this.rightSlide, CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.RIGHT);
    }

    private initializeSlide(slide: HTMLElement | undefined, className: string): void {
        if (slide) {
            slide.classList.add(className);
            slide.classList.remove(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.HIDDEN);
            slide.style.transform = null;
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

    private handleTouchStart(event: TouchEvent): void {
        if (event.touches.length === 1 && !this.swipeStarted) {
            this.swipeDetecting = true;
            this.startTouch = event.changedTouches[0];
        }
        this.startTime = performance.now();
    }

    private handleTouchMove(event: TouchEvent): void {
        if (event.touches.length === 1) {
            event.preventDefault();
            if (this.swipeDetecting) {
                if (this.isHorizontalSwipe(event.changedTouches[0])) {
                    this.swipeStarted = true;
                }
                this.swipeDetecting = false;
            }
            if (this.swipeStarted) {
                this.moveTo(this.getDelta(event.changedTouches[0]));
            }
        }
    }

    /**
     * If horizontal offset greater than vertical then it is swipe
     * @param {Touch} touch - touch to check
     */
    private isHorizontalSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) >=
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    private handleTouchEnd(event: TouchEvent): void {
        if (this.swipeStarted) {
            event.preventDefault();
            this.slideTo(this.getDelta(event.changedTouches[0]));
        }
        this.swipeStarted = false;
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

    private handleTransitionEnd(): void {
        this.getSlides().forEach((slide) => slide.classList.remove(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.ANIMATING));
        if (this.slideToLeftAnimation) {
            this.centerSlide = (this.leftSlide as HTMLElement);
            this.slideToLeftAnimation = false;
        }
        if (this.slideToRightAnimation) {
            this.centerSlide = (this.rightSlide as HTMLElement);
            this.slideToRightAnimation = false;
        }
        this.resetNavigationInAccordanceWithCurrentSlide();
    }

    private getSlides(): HTMLElement[] {
        return [this.leftSlide, this.centerSlide, this.rightSlide].filter((slide) => slide) as HTMLElement[];
    }

    private slideTo(delta: number): void {
        this.getSlides().forEach((slide) => slide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE.MODIFIERS.ANIMATING));
        const shouldSlide: boolean = Math.abs(delta) > this.settings.deltaThreshold ||
            performance.now() - this.startTime < this.settings.timeThresholdInMs;
        if (shouldSlide && delta < 0 && this.rightSlide) {
            this.slideToRight();
        } else if (shouldSlide && delta > 0 && this.leftSlide) {
            this.slideToLeft();
        } else {
            this.moveTo(0);
        }
    }

    private slideToRight(): void {
        (this.rightSlide as HTMLElement).style.transform = "translate3d(0, 0, 0)";
        this.centerSlide.style.transform = "translate3d(-100%, 0, 0)";
        this.slideToRightAnimation = true;
    }

    private slideToLeft(): void {
        (this.leftSlide as HTMLElement).style.transform = "translate3d(0, 0, 0)";
        this.centerSlide.style.transform = "translate3d(100%, 0, 0)";
        this.slideToLeftAnimation = true;
    }

    private moveTo(delta: number): void {
        if (this.leftSlide) {
            this.leftSlide.style.transform = `translate3d(${delta - 100}%, 0, 0`;
        }
        this.centerSlide.style.transform = `translate3d(${delta}%, 0, 0`;
        if (this.rightSlide) {
            this.rightSlide.style.transform = `translate3d(${delta + 100}%, 0, 0`;
        }
    }

}
