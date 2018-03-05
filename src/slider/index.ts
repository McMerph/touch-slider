import { limit } from "../utils/Utils";
import CLASS_NAMES from "./ClassNames";

interface ISettings {
    boundaryResistanceReduction: number;
    deltaThreshold: number;
    slidesPerView: number;
    spaceBetween: number;
    timeThresholdInMs: number;
}

enum State { Idle, TouchStarted, Swipe, Positioning }

export default class Slider {

    private static defaultSettings: ISettings = {
        boundaryResistanceReduction: 5,
        deltaThreshold: 50,
        slidesPerView: 1,
        spaceBetween: 0,
        timeThresholdInMs: 300,
    };

    private readonly container: HTMLElement;
    private readonly wrapper: HTMLElement;
    private readonly settings: ISettings;

    private state: State = State.Idle;
    private currentIndex: number = 0;
    private offset: number;
    private startTouch: Touch;
    private startTime: number;

    public constructor(container: HTMLElement, settings?: Partial<ISettings>) {
        this.container = container;
        this.settings = { ...Slider.defaultSettings, ...settings };

        this.wrapper = document.createElement("div");
        this.wrapper.classList.add(CLASS_NAMES.ELEMENTS.WRAPPER);
        this.container.classList.add(CLASS_NAMES.BLOCK);
        this.container.appendChild(this.wrapper);
        this.addEventListeners();
        this.updateClassNames();
    }

    public appendSlide(slide: HTMLElement): void {
        this.updateSlide(slide);
        this.wrapper.appendChild(slide);
    }

    public updateClassNames(): void {
        for (let i = 0; i < this.wrapper.children.length; i++) {
            this.updateSlide(this.wrapper.children.item(i) as HTMLElement);
        }
    }

    public previous(): void {
        this.slideTo(this.currentIndex - 1);
    }

    public next(): void {
        this.slideTo(this.currentIndex + 1);
    }

    public slideTo(index: number): void {
        const normalizedIndex = limit({
            max: this.wrapper.children.length - this.settings.slidesPerView,
            min: 0,
            value: index,
        });
        if (normalizedIndex !== this.currentIndex) {
            this.offset = (this.currentIndex - Math.floor(index)) * this.getSlideWidth();
            this.moveToNearestSlide();
        }
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
                    this.offset = this.generateOffset(event.changedTouches[0]);
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

    private updateSlide(slide: HTMLElement): void {
        slide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE);
        slide.style.width = `${this.getSlideWidth()}px`;
    }

    private getSlideWidth(): number {
        return this.wrapper.clientWidth / this.settings.slidesPerView;
    }

    /**
     * If horizontal offset greater than vertical then it is swipe
     * @param {Touch} touch - touch to check
     */
    private isHorizontalSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) >
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    private generateOffset(touch: Touch): number {
        const { slidesPerView } = this.settings;

        const pixelsDelta: number = touch.pageX - this.startTouch.pageX;
        const indexDelta: number = pixelsDelta / this.wrapper.clientWidth * slidesPerView;
        const directionOffset: number = pixelsDelta > 0 ? slidesPerView : 0;
        const pulledSlideIndex: number = this.currentIndex - Math.ceil(indexDelta) + slidesPerView - directionOffset;
        let offset: number = pixelsDelta;
        const beforeLeft: boolean = pulledSlideIndex < 0;
        const afterRight: boolean = pulledSlideIndex > this.wrapper.children.length - 1;
        if (beforeLeft || afterRight) {
            const toBorder: number = beforeLeft ? this.getOffsetToLeft() : this.getOffsetToRight();
            offset = toBorder + (offset - toBorder) / this.settings.boundaryResistanceReduction;
        }

        return offset;
    }

    private getOffsetToLeft(): number {
        return this.currentIndex * this.getSlideWidth();
    }

    private getOffsetToRight(): number {
        const { slidesPerView } = this.settings;
        return (this.currentIndex + slidesPerView - this.wrapper.children.length) * this.getSlideWidth();
    }

    private moveToNearestSlide(): void {
        this.setOffsetToNearestSlide();
        this.wrapper.style.transitionDuration = "200ms";
        this.move();
        this.currentIndex -= this.offset / this.getSlideWidth();
        this.state = State.Positioning;
    }

    private setOffsetToNearestSlide(): void {
        const { deltaThreshold, timeThresholdInMs } = this.settings;

        let slidesOffset: number = -this.offset / this.getSlideWidth();
        const next: boolean = (slidesOffset - Math.floor(slidesOffset)) > (deltaThreshold / 100);
        let integerSlidesOffset: number = next ? Math.floor(slidesOffset) + 1 : Math.floor(slidesOffset);
        if (integerSlidesOffset === 0 && performance.now() - this.startTime < timeThresholdInMs) {
            integerSlidesOffset = (this.offset > 0) ? -1 : 1;
        }
        slidesOffset = limit({
            max: this.wrapper.children.length - this.settings.slidesPerView - this.currentIndex,
            min: -this.currentIndex,
            value: integerSlidesOffset,
        });
        this.offset = slidesOffset * -this.getSlideWidth();
    }

    private move(): void {
        const moveX: number = -this.currentIndex * this.getSlideWidth() + this.offset;
        this.wrapper.style.transform = `translate3d(${moveX}px, 0, 0`;
    }

}
