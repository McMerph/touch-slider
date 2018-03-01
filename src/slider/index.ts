import "./index.css";

export default class Slider {

    private static readonly MAX_DELTA = 95;
    private static readonly DELTA_THRESHOLD = 50;
    private static readonly TIME_THRESHOLD_IN_MS = 300;

    private static readonly HIDDEN_CLASS: string = "visually-hidden";
    private static readonly SLIDER_CLASS: string = "slider";
    private static readonly SLIDE_CLASS: string = "slide";
    private static readonly LEFT_SLIDE_CLASS = "slide_left";
    private static readonly CURRENT_SLIDE_CLASS = "slide_current";
    private static readonly RIGHT_SLIDE_CLASS = "slide_right";
    private static readonly ANIMATING_CLASS: string = "slide_animating";

    private readonly element: HTMLElement;

    private startTouch: Touch;
    private swipeStarted: boolean = false;
    private swipeDetecting: boolean = false;

    private leftSlide: HTMLElement | undefined;
    private centerSlide: HTMLElement;
    private rightSlide: HTMLElement | undefined;
    private slideToLeftAnimation: boolean = false;
    private slideToRightAnimation: boolean = false;
    private startTime: number;

    public constructor(element: HTMLElement) {
        this.element = element;
        this.element.classList.add(Slider.SLIDER_CLASS);
        this.isHorizontalSwipe = this.isHorizontalSwipe.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
        const children: HTMLCollection = this.element.children;
        if (children.length > 0) {
            this.centerSlide = (this.element.firstElementChild as HTMLElement);
            this.centerSlide.classList.add(Slider.CURRENT_SLIDE_CLASS);
            for (let i = 0; i < this.element.children.length; i++) {
                this.element.children[i].classList.add(Slider.SLIDE_CLASS, Slider.HIDDEN_CLASS);
            }
            this.initializeNavigation();

            this.element.addEventListener("touchstart", this.handleTouchStart);
            this.element.addEventListener("touchmove", this.handleTouchMove);
            this.element.addEventListener("touchend", this.handleTouchEnd);
            this.element.addEventListener("touchcancel", this.handleTouchEnd);
            this.element.addEventListener("transitionend", this.handleTransitionEnd);
        }
    }

    public manualSlideToLeft(): void {
        this.slideTo(100);
    }

    public manualSlideToRight(): void {
        this.slideTo(-100);
    }

    private initializeNavigation(): void {
        for (let i = 0; i < this.element.children.length; i++) {
            this.removeSlideFromNavigation((this.element.children[i]) as HTMLElement);
        }
        this.initializeLeftSlide();
        this.initializeCenterSlide();
        this.initializeRightSlide();
    }

    private removeSlideFromNavigation(slide: HTMLElement): void {
        slide.classList.remove(
            Slider.LEFT_SLIDE_CLASS,
            Slider.CURRENT_SLIDE_CLASS,
            Slider.RIGHT_SLIDE_CLASS,
        );
        slide.classList.add(Slider.HIDDEN_CLASS);
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

    private handleTouchEnd(event: TouchEvent): void {
        if (this.swipeStarted) {
            event.preventDefault();
            this.slideTo(this.getDelta(event.changedTouches[0]));
        }
        this.swipeStarted = false;
    }

    private handleTransitionEnd(): void {
        this.getSlides().forEach((slide) => slide.classList.remove(Slider.ANIMATING_CLASS));
        if (this.slideToLeftAnimation) {
            this.centerSlide = (this.leftSlide as HTMLElement);
            this.slideToLeftAnimation = false;
        }
        if (this.slideToRightAnimation) {
            this.centerSlide = (this.rightSlide as HTMLElement);
            this.slideToRightAnimation = false;
        }
        this.initializeNavigation();
    }

    private getDelta(touch: Touch): number {
        let delta: number = touch.pageX - this.startTouch.pageX;
        if ((delta > 0 && !this.leftSlide) || (delta < 0 && !this.rightSlide)) {
            delta = delta / 5;
        }
        delta = delta / this.element.clientWidth * 100;
        delta = delta > Slider.MAX_DELTA ? Slider.MAX_DELTA : delta;
        delta = delta < -Slider.MAX_DELTA ? -Slider.MAX_DELTA : delta;

        return delta;
    }

    private getSlides(): HTMLElement[] {
        const slides = [];
        if (this.leftSlide) {
            slides.push(this.leftSlide);
        }
        slides.push(this.centerSlide);
        if (this.rightSlide) {
            slides.push(this.rightSlide);
        }

        return slides;
    }

    private initializeLeftSlide(): void {
        const left = this.centerSlide.previousElementSibling;
        if (left) {
            this.leftSlide = left as HTMLElement;
            this.leftSlide.classList.add(Slider.LEFT_SLIDE_CLASS);
            this.leftSlide.classList.remove(Slider.HIDDEN_CLASS);
            this.leftSlide.style.transform = null;
        } else {
            this.leftSlide = undefined;
        }
    }

    private initializeCenterSlide(): void {
        this.centerSlide.classList.add(Slider.CURRENT_SLIDE_CLASS);
        this.centerSlide.classList.remove(Slider.HIDDEN_CLASS);
        this.centerSlide.style.transform = null;
    }

    private initializeRightSlide(): void {
        const right = this.centerSlide.nextElementSibling;
        if (right) {
            this.rightSlide = right as HTMLElement;
            this.rightSlide.classList.add(Slider.RIGHT_SLIDE_CLASS);
            this.rightSlide.classList.remove(Slider.HIDDEN_CLASS);
            this.rightSlide.style.transform = null;
        } else {
            this.rightSlide = undefined;
        }
    }

    private slideTo(delta: number): void {
        this.getSlides().forEach((slide) => slide.classList.add(Slider.ANIMATING_CLASS));
        const shouldSlide: boolean = Math.abs(delta) > Slider.DELTA_THRESHOLD ||
            performance.now() - this.startTime < Slider.TIME_THRESHOLD_IN_MS;
        if (shouldSlide && delta < 0 && this.rightSlide) {
            this.slideToRight();
        } else if (shouldSlide && delta > 0 && this.leftSlide) {
            this.slideToLeft();
        } else {
            this.resetSlidesPositions();
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

    private resetSlidesPositions(): void {
        if (this.leftSlide) {
            this.leftSlide.style.transform = "translate3d(-100%, 0, 0)";
        }

        this.centerSlide.style.transform = "translate3d(0, 0, 0)";

        if (this.rightSlide) {
            this.rightSlide.style.transform = "translate3d(100%, 0, 0)";
        }
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

    /**
     * If horizontal offset greater than vertical then it is swipe
     * @param {Touch} touch - touch to check
     */
    private isHorizontalSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) >=
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

}
