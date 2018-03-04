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
        this.positionTo((this.currentIndex - Math.floor(index)) * 100);
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
                this.positionTo(this.getOffset(event.changedTouches[0]));
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
        return Math.abs(this.startTouch.pageX - touch.pageX) >=
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    private getOffset(touch: Touch): number {
        const offsetInPixels: number = touch.pageX - this.startTouch.pageX;

        let offset = offsetInPixels / this.container.clientWidth * 100;
        let requestedSlideIndex = Math.ceil(this.currentIndex - offset / 100);
        if (offsetInPixels > 0) {
            requestedSlideIndex--;
        }
        if (requestedSlideIndex < 0) {
            const offsetToLeft = this.getOffsetToLeft();
            offset = offsetToLeft + (offset - offsetToLeft) / this.settings.boundaryResistanceReduction;
        } else if (requestedSlideIndex > this.wrapper.children.length - 1) {
            const offsetToRight = this.getOffsetToRight();
            offset = offsetToRight + (offset - offsetToRight) / this.settings.boundaryResistanceReduction;
        }

        return offset;
    }

    private getOffsetToLeft(): number {
        return this.currentIndex * 100;
    }

    private getOffsetToRight(): number {
        return (this.currentIndex + 1 - this.wrapper.children.length) * 100;
    }

    private positionTo(offset: number): void {
        const excessDeltaThreshold: boolean = Math.abs(offset) > this.settings.deltaThreshold;
        const excessTimeThreshold: boolean = performance.now() - this.startTime < this.settings.timeThresholdInMs;
        if (excessDeltaThreshold || excessTimeThreshold) {
            const offsetToNearestSlide = limit({
                max: this.getOffsetToLeft(),
                min: this.getOffsetToRight(),
                value: Math.ceil(Math.abs(offset) / 100) * (offset > 0 ? 100 : -100),
            });
            this.offset = offsetToNearestSlide;
            this.move();
            this.currentIndex = limit({
                max: this.wrapper.children.length - 1,
                min: 0,
                value: this.currentIndex -= offsetToNearestSlide / 100,
            });
        } else {
            this.offset = 0;
            this.move();
        }
        this.wrapper.classList.add(CLASS_NAMES.MODIFIERS.ANIMATING);
        this.state = State.Positioning;
    }

    private move(): void {
        this.wrapper.style.transform = `translate3d(${-this.currentIndex * 100 + this.offset}%, 0, 0`;
    }

}
