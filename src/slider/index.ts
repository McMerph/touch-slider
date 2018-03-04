import { limit } from "../utils/Utils";
import CLASS_NAMES from "./ClassNames";

interface ISettings {
    boundaryResistanceReduction: number;
    deltaThreshold: number;
    timeThresholdInMs: number;
}

enum State { Idle, TouchStarted, Swipe, Positioning }

export default class Slider {

    private static defaultSettings: ISettings = {
        boundaryResistanceReduction: 5,
        deltaThreshold: 50,
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
        this.wrapper.appendChild(slide);
    }

    public updateClassNames(): void {
        for (let i = 0; i < this.container.children.length; i++) {
            this.container.children.item(i).classList.add(CLASS_NAMES.ELEMENTS.SLIDE);
        }
    }

    public previous(): void {
        this.slideTo(this.currentIndex - 1);
    }

    public next(): void {
        this.slideTo(this.currentIndex + 1);
    }

    public slideTo(index: number): void {
        this.offset = (this.currentIndex - Math.floor(index)) * 100;
        this.moveToNearestSlide();
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
                    this.offset = this.getOffset(event.changedTouches[0]);
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

    private getOffset(touch: Touch): number {
        const pixelsDelta: number = touch.pageX - this.startTouch.pageX;
        const indexDelta: number = pixelsDelta / this.container.clientWidth;
        const pulledSlideIndex: number = Math.ceil(this.currentIndex - indexDelta) - (pixelsDelta > 0 ? 1 : 0);

        let offset: number = indexDelta * 100;
        const beforeLeft: boolean = pulledSlideIndex < 0;
        const afterRight: boolean = pulledSlideIndex > this.wrapper.children.length - 1;
        if (beforeLeft || afterRight) {
            const toBorder: number = beforeLeft ? this.getOffsetToLeft() : this.getOffsetToRight();
            offset = toBorder + (offset - toBorder) / this.settings.boundaryResistanceReduction;
        }

        return offset;
    }

    private getOffsetToLeft(): number {
        return this.currentIndex * 100;
    }

    private getOffsetToRight(): number {
        return (this.currentIndex + 1 - this.wrapper.children.length) * 100;
    }

    private moveToNearestSlide(): void {
        const excessDeltaThreshold: boolean = Math.abs(this.offset) > this.settings.deltaThreshold;
        const excessTimeThreshold: boolean = performance.now() - this.startTime < this.settings.timeThresholdInMs;
        this.offset = excessDeltaThreshold || excessTimeThreshold ? limit({
            max: this.getOffsetToLeft(),
            min: this.getOffsetToRight(),
            value: Math.ceil(Math.abs(this.offset) / 100) * (this.offset > 0 ? 100 : -100),
        }) : 0;
        this.move();
        this.currentIndex -= this.offset / 100;
        this.wrapper.classList.add(CLASS_NAMES.MODIFIERS.ANIMATING);
        this.state = State.Positioning;
    }

    private move(): void {
        this.wrapper.style.transform = `translate3d(${-this.currentIndex * 100 + this.offset}%, 0, 0`;
    }

}
