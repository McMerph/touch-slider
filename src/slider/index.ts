import { limit } from "../utils/Utils";
import CLASS_NAMES from "./ClassNames";

interface ISettings {
    boundaryResistanceReduction: number;
    deltaThreshold: number;
    slidesPerView: number;
    timeThresholdInMs: number;
}

enum State { Idle, TouchStarted, Swipe, Positioning }

export default class Slider {

    private static defaultSettings: ISettings = {
        boundaryResistanceReduction: 5,
        deltaThreshold: 50,
        slidesPerView: 1,
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
        slide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE);
        slide.style.width = `${100 / this.settings.slidesPerView}%`;
        this.wrapper.appendChild(slide);
    }

    public updateClassNames(): void {
        for (let i = 0; i < this.wrapper.children.length; i++) {
            const slide = this.wrapper.children.item(i) as HTMLElement;
            slide.classList.add(CLASS_NAMES.ELEMENTS.SLIDE);
            slide.style.width = `${100 / this.settings.slidesPerView}%`;
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
            this.offset = (this.currentIndex - Math.floor(index)) * 100 / this.settings.slidesPerView;
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
            this.wrapper.classList.remove(CLASS_NAMES.MODIFIERS.ANIMATING);
            this.state = State.Idle;
        });
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
        const pixelsDelta: number = touch.pageX - this.startTouch.pageX;
        const { slidesPerView } = this.settings;
        const indexDelta: number = pixelsDelta / this.wrapper.clientWidth * slidesPerView;
        const directionOffset: number | number = pixelsDelta > 0 ? slidesPerView : 0;
        const pulledSlideIndex: number = this.currentIndex - Math.ceil(indexDelta) + slidesPerView - directionOffset;

        let offset: number = pixelsDelta / this.wrapper.clientWidth * 100;
        const beforeLeft: boolean = pulledSlideIndex < 0;
        const afterRight: boolean = pulledSlideIndex > this.wrapper.children.length - 1;
        if (beforeLeft || afterRight) {
            const toBorder: number = beforeLeft ? this.getOffsetToLeft() : this.getOffsetToRight();
            offset = toBorder + (offset - toBorder) / this.settings.boundaryResistanceReduction;
        }

        return offset;
    }

    private getOffsetToLeft(): number {
        return this.currentIndex * 100 / this.settings.slidesPerView;
    }

    private getOffsetToRight(): number {
        const { slidesPerView } = this.settings;
        return (this.currentIndex + slidesPerView - this.wrapper.children.length) * 100 / slidesPerView;
    }

    private moveToNearestSlide(): void {
        this.setOffsetToNearestSlide();
        this.move();
        const slideWidth: number = 100 / this.settings.slidesPerView;
        this.currentIndex -= this.offset / slideWidth;

        this.wrapper.classList.add(CLASS_NAMES.MODIFIERS.ANIMATING);
        this.state = State.Positioning;
    }

    private setOffsetToNearestSlide(): void {
        const { deltaThreshold, timeThresholdInMs } = this.settings;
        const slideWidth: number = 100 / this.settings.slidesPerView;

        const slidesOffset: number = -this.offset / slideWidth;
        const next: boolean = (slidesOffset - Math.floor(slidesOffset)) > (deltaThreshold / 100);
        let integerSlidesOffset: number = next ? Math.floor(slidesOffset) + 1 : Math.floor(slidesOffset);

        if (integerSlidesOffset === 0) {
            const excessTimeThreshold: boolean = performance.now() - this.startTime < timeThresholdInMs;
            if (excessTimeThreshold) {
                integerSlidesOffset = (this.offset > 0) ? -1 : 1;
            }
        }

        const desiredSlidesOffset: number = limit({
            max: this.wrapper.children.length - this.settings.slidesPerView - this.currentIndex,
            min: -this.currentIndex,
            value: integerSlidesOffset,
        });
        this.offset = desiredSlidesOffset * -slideWidth;
    }

    private move(): void {
        const slideWidth: number = 100 / this.settings.slidesPerView;
        this.wrapper.style.transform = `translate3d(${-this.currentIndex * slideWidth + this.offset}%, 0, 0`;
    }

}
