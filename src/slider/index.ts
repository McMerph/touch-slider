import { limit } from "../utils/Utils";
import CLASS_NAMES from "./ClassNames";
import ISettings from "./ISettings";

enum State { Idle, TouchStarted, Swipe, Positioning }

export default class Slider {

    private static defaultSettings: ISettings = {
        deltaThreshold: 50,
        outOfBoundsResistance: 5,
        slidesPerView: 1,
        spaceBetween: 0,
        timeThresholdInMs: 300,
        transitionDurationInMs: 200,
    };

    private readonly container: HTMLElement;
    private readonly wrapper: HTMLElement;
    private readonly settings: ISettings;

    private state: State = State.Idle;
    private currentIndex: number = 0;
    private slidesPerView: number;

    private currentSlideOffset: number;
    private totalOffset: number;
    private startTouch: Touch;
    private startTime: number;

    public constructor(container: HTMLElement, settings?: Partial<ISettings>) {
        this.container = container;
        this.wrapper = document.createElement("div");
        this.settings = { ...Slider.defaultSettings, ...settings };
        this.slidesPerView = this.settings.slidesPerView;

        this.wrapper.classList.add(CLASS_NAMES.ELEMENTS.WRAPPER);
        this.container.classList.add(CLASS_NAMES.BLOCK);
        this.container.appendChild(this.wrapper);
        this.addEventListeners();
    }

    public appendSlide(slide: HTMLElement): void {
        slide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE);
        this.wrapper.appendChild(slide);
        this.slidesPerView = Math.min(this.settings.slidesPerView, this.wrapper.children.length);
        for (let i = 0; i < this.wrapper.children.length; i++) {
            const wrapperSlide = this.wrapper.children.item(i) as HTMLElement;
            if (i < this.wrapper.children.length - 1) {
                wrapperSlide.style.marginRight = `${this.settings.spaceBetween}px`;
            }
            wrapperSlide.style.width = `${this.getSlideWidth()}px`;
        }
    }

    public previous(): void {
        this.slideTo(this.currentIndex - 1);
    }

    public next(): void {
        this.slideTo(this.currentIndex + 1);
    }

    public slideTo(index: number): void {
        this.totalOffset = NaN;
        const normalizedIndex = this.getNormalizedIndex(Math.floor(index));
        if (normalizedIndex !== this.currentIndex) {
            this.currentSlideOffset = (this.currentIndex - normalizedIndex) * this.getSlideWidth();
            this.moveToNearestSlide();
        }
    }

    private getNormalizedIndex(index: number): number {
        return limit({
            max: this.wrapper.children.length - this.slidesPerView,
            min: 0,
            value: index,
        });
    }

    private addEventListeners(): void {
        this.container.addEventListener("touchstart", (event) => {
            if (event.touches.length === 1 && this.state === State.Idle) {
                event.preventDefault();
                this.startTouch = event.changedTouches[0];
                this.startTime = performance.now();
                this.state = State.TouchStarted;
            }
        });

        this.container.addEventListener("touchmove", (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                if (this.state === State.TouchStarted) {
                    if (this.isHorizontalSwipe(event.changedTouches[0])) {
                        this.state = State.Swipe;
                    }
                } else if (this.state === State.Swipe) {
                    this.currentSlideOffset = this.getTouchOffset(event.changedTouches[0]);
                    this.move();
                }
            }
        });

        const handleTouchEnd: (event: TouchEvent) => void = (event) => {
            if (this.state === State.Swipe) {
                event.preventDefault();
                this.moveToNearestSlide();
            }
        };
        this.container.addEventListener("touchend", handleTouchEnd);
        this.container.addEventListener("touchcancel", handleTouchEnd);

        this.container.addEventListener("transitionend", () => {
            this.wrapper.style.transitionDuration = null;
            this.state = State.Idle;
        });
    }

    private getSlideWidth(): number {
        const { spaceBetween } = this.settings;
        return (this.wrapper.clientWidth - (this.slidesPerView - 1) * spaceBetween) / this.slidesPerView;
    }

    /**
     * If horizontal offset greater than vertical then it is swipe
     * @param {Touch} touch - touch to check
     */
    private isHorizontalSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) >
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    private getTouchOffset(touch: Touch): number {
        const { currentIndex, slidesPerView } = this;

        const pixelsDelta: number = touch.pageX - this.startTouch.pageX;
        const indexDelta: number = pixelsDelta / this.wrapper.clientWidth * slidesPerView;
        const directionOffset: number = pixelsDelta > 0 ? slidesPerView : 0;
        const pulledSlideIndex: number = currentIndex - Math.ceil(indexDelta) + slidesPerView - directionOffset;
        let offset: number = pixelsDelta;
        const beforeLeft: boolean = pulledSlideIndex < 0;
        const afterRight: boolean = pulledSlideIndex > this.wrapper.children.length - 1;
        if (beforeLeft || afterRight) {
            const toBorder: number = beforeLeft ? this.getOffsetToLeft() : this.getOffsetToRight();
            offset = toBorder + (offset - toBorder) / this.settings.outOfBoundsResistance;
        }

        return offset;
    }

    private getOffsetToLeft(): number {
        return this.currentIndex * (this.getSlideWidth() + this.settings.spaceBetween);
    }

    private getOffsetToRight(): number {
        const { spaceBetween } = this.settings;

        const slideWidth: number = this.getSlideWidth();
        const slidesCount: number = this.wrapper.children.length;
        const slidesOffsetToRight: number = (this.currentIndex + this.slidesPerView - slidesCount) * slideWidth;
        const marginsOffsetToRight: number = (slidesCount - this.currentIndex - this.slidesPerView) * spaceBetween;

        return slidesOffsetToRight - marginsOffsetToRight;
    }

    private moveToNearestSlide(): void {
        const { spaceBetween } = this.settings;

        const integerSlidesOffset: number = this.getIntegerSlidesOffset();
        this.currentSlideOffset = limit({
            max: this.getOffsetToLeft(),
            min: this.getOffsetToRight(),
            value: -integerSlidesOffset * (this.getSlideWidth() + spaceBetween),
        });
        if (this.totalOffset % this.currentSlideOffset !== 0) {
            this.move();
            this.wrapper.style.transitionDuration = `${this.settings.transitionDurationInMs}ms`;
            this.state = State.Positioning;
        } else {
            this.state = State.Idle;
        }
        this.currentIndex = this.getNormalizedIndex(this.currentIndex + integerSlidesOffset);
    }

    private getIntegerSlidesOffset(): number {
        const { deltaThreshold, timeThresholdInMs } = this.settings;

        const slidesOffset: number = -this.currentSlideOffset / this.getSlideWidth();
        const next: boolean = (slidesOffset - Math.floor(slidesOffset)) > (deltaThreshold / 100);
        let integerSlidesOffset: number = next ? Math.floor(slidesOffset) + 1 : Math.floor(slidesOffset);
        if (integerSlidesOffset === 0 && performance.now() - this.startTime < timeThresholdInMs) {
            integerSlidesOffset = (this.currentSlideOffset > 0) ? -1 : 1;
        }

        return integerSlidesOffset;
    }

    private move(): void {
        const { spaceBetween } = this.settings;
        const slideWidth: number = this.getSlideWidth();
        this.totalOffset = -this.currentIndex * (slideWidth + spaceBetween) + this.currentSlideOffset;
        this.wrapper.style.transform = `translate3d(${this.totalOffset}px, 0, 0`;
    }

}
