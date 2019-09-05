import CLASS_NAMES from "./ClassNames";
import ISettings from "./ISettings";
import { limit } from "./Utils";

enum State { Idle, TouchStarted, Swipe, Positioning }

export default abstract class AbstractSlider {

    private static defaultSettings: ISettings = {
        deltaThreshold: 50,
        outOfBoundsResistance: 5,
        slidesPerView: 1,
        spaceBetween: 0,
        timeThresholdInMs: 300,
        transitionDurationInMs: 200,
    };

    protected readonly wrapper: HTMLElement;
    protected readonly settings: ISettings;

    protected totalOffset: number;
    protected startTouch: Touch;

    private state: State = State.Idle;
    private currentIndex: number = 0;
    private slidesPerView: number;

    private currentSlideOffset: number;
    private startTime: number;

    public constructor(container: HTMLElement, settings?: Partial<ISettings>) {
        this.wrapper = document.createElement("div");
        this.settings = { ...AbstractSlider.defaultSettings, ...settings };
        this.slidesPerView = this.settings.slidesPerView;

        this.wrapper.classList.add(CLASS_NAMES.ELEMENTS.WRAPPER.NAME);
        this.wrapper.classList.add(...this.getWrapperClassNames());

        container.classList.add(CLASS_NAMES.BLOCK);
        container.appendChild(this.wrapper);
        this.addEventListeners(container);
    }

    public appendSlide(slide: HTMLElement): void {
        slide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE);
        this.wrapper.appendChild(slide);
        this.slidesPerView = Math.min(this.settings.slidesPerView, this.wrapper.children.length);
        this.update();
    }

    public previous(): void {
        this.slideTo(this.currentIndex - 1);
    }

    public next(): void {
        this.slideTo(this.currentIndex + 1);
    }

    public slideTo(index: number): void {
        const normalizedIndex = this.getNormalizedIndex(Math.floor(index));
        this.currentSlideOffset = (this.currentIndex - normalizedIndex) * this.getSlideSize();
        this.moveToNearestSlide();
    }

    protected abstract getSizeProperty(): string;

    protected abstract getMarginProperty(): string;

    protected abstract getWrapperSize(): number;

    protected abstract isSwipe(touch: Touch): boolean;

    protected abstract getPixelsDelta(touch: Touch): number;

    protected abstract getTranslate3dParameters(): string;

    protected getWrapperClassNames(): string[] {
        return [];
    }

    private getSlideSize(): number {
        const { spaceBetween } = this.settings;
        return (this.getWrapperSize() - (this.slidesPerView - 1) * spaceBetween) / this.slidesPerView;
    }

    private update(): void {
        for (let i = 0; i < this.wrapper.children.length; i++) {
            const slide = this.wrapper.children.item(i) as HTMLElement;
            if (i < this.wrapper.children.length - 1) {
                slide.style[this.getMarginProperty() as any] = `${this.settings.spaceBetween}px`;
            }
            slide.style[this.getSizeProperty() as any] = `${this.getSlideSize()}px`;
        }
    }

    private getNormalizedIndex(index: number): number {
        return limit({
            max: this.wrapper.children.length - this.slidesPerView,
            min: 0,
            value: index,
        });
    }

    private addEventListeners(container: HTMLElement): void {
        window.addEventListener("resize", () => {
            this.update();
            this.slideTo(this.currentIndex);
        });

        container.addEventListener("touchstart", (event) => {
            if (event.touches.length === 1 && this.state === State.Idle) {
                event.preventDefault();
                this.startTouch = event.changedTouches[0];
                this.startTime = performance.now();
                this.state = State.TouchStarted;
            }
        });

        container.addEventListener("touchmove", (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                if (this.state === State.TouchStarted) {
                    if (this.isSwipe(event.changedTouches[0])) {
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
        container.addEventListener("touchend", handleTouchEnd);
        container.addEventListener("touchcancel", handleTouchEnd);

        container.addEventListener("transitionend", () => {
            this.wrapper.style.transitionDuration = "0";
            this.state = State.Idle;
        });
    }

    private getTouchOffset(touch: Touch): number {
        const { currentIndex, slidesPerView } = this;

        const pixelsDelta: number = this.getPixelsDelta(touch);
        const indexDelta: number = pixelsDelta / this.wrapper.clientWidth * slidesPerView;
        const directionOffset: number = pixelsDelta > 0 ? slidesPerView : 0;
        const pulledSlideIndex: number = currentIndex - Math.ceil(indexDelta) + slidesPerView - directionOffset;
        let offset: number = pixelsDelta;
        const beforeLeft: boolean = pulledSlideIndex < 0;
        const afterRight: boolean = pulledSlideIndex > this.wrapper.children.length - 1;
        if (beforeLeft || afterRight) {
            const toBorder: number = beforeLeft ? this.getOffsetToStart() : this.getOffsetToEnd();
            offset = toBorder + (offset - toBorder) / this.settings.outOfBoundsResistance;
        }

        return offset;
    }

    private getOffsetToStart(): number {
        return this.currentIndex * (this.getSlideSize() + this.settings.spaceBetween);
    }

    private getOffsetToEnd(): number {
        const { spaceBetween } = this.settings;

        const slideSize: number = this.getSlideSize();
        const slidesCount: number = this.wrapper.children.length;
        const slidesOffset: number = (this.currentIndex + this.slidesPerView - slidesCount) * slideSize;
        const marginsOffset: number = (slidesCount - this.currentIndex - this.slidesPerView) * spaceBetween;

        return slidesOffset - marginsOffset;
    }

    private moveToNearestSlide(): void {
        const { spaceBetween } = this.settings;

        const integerSlidesOffset: number = this.getIntegerSlidesOffset();
        this.currentSlideOffset = limit({
            max: this.getOffsetToStart(),
            min: this.getOffsetToEnd(),
            value: -integerSlidesOffset * (this.getSlideSize() + spaceBetween),
        });
        if (this.move()) {
            this.wrapper.style.transitionDuration = `${this.settings.transitionDurationInMs}ms`;
            this.state = State.Positioning;
        } else {
            this.state = State.Idle;
        }
        this.currentIndex = this.getNormalizedIndex(this.currentIndex + integerSlidesOffset);
    }

    private getIntegerSlidesOffset(): number {
        const { deltaThreshold, timeThresholdInMs } = this.settings;

        const slidesOffset: number = -this.currentSlideOffset / this.getSlideSize();
        const next: boolean = (slidesOffset - Math.floor(slidesOffset)) > (deltaThreshold / 100);
        let integerSlidesOffset: number = next ? Math.floor(slidesOffset) + 1 : Math.floor(slidesOffset);
        if (integerSlidesOffset === 0 && performance.now() - this.startTime < timeThresholdInMs) {
            integerSlidesOffset = (this.currentSlideOffset > 0) ? -1 : 1;
        }

        return integerSlidesOffset;
    }

    private move(): boolean {
        const { spaceBetween } = this.settings;
        const { currentIndex, currentSlideOffset } = this;

        const newOffset: number = -currentIndex * (this.getSlideSize() + spaceBetween) + currentSlideOffset;
        const shouldMove: boolean = this.totalOffset !== newOffset;
        if (shouldMove) {
            this.totalOffset = newOffset;
            this.wrapper.style.transform = `translate3d(${this.getTranslate3dParameters()})`;
        }

        return shouldMove;
    }

}
