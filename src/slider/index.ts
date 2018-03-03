import CLASS_NAMES from "./ClassNames";
import "./index.css";

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

    private startTouch: Touch;
    private startTime: number;

    public constructor(container: HTMLElement, settings?: Partial<ISettings>) {
        this.container = container;
        this.settings = {...Slider.defaultSettings, ...settings};

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
        this.goToSlide(this.currentIndex);
    }

    public next(): void {
        this.goToSlide(this.currentIndex + 2);
    }

    // TODO goTo() vs slideTo()
    public goToSlide(index: number): void {
        console.log(`this.currentIndex = ${this.currentIndex}`);
        this.state = State.Positioning;
        this.slideTo((this.currentIndex - Math.floor(index - 1)) * 100);
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
                    this.setTranslate(this.getOffsetInPercents(event.changedTouches[0]));
                }
            }
        });

        const handleTouchEnd: (event: TouchEvent) => void = (event) => {
            if (this.state === State.Swipe) {
                event.preventDefault();
                this.state = State.Positioning;
                this.slideTo(this.getOffsetInPercents(event.changedTouches[0]));
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

    private getOffsetInPercents(touch: Touch): number {
        const offsetInPixels: number = touch.pageX - this.startTouch.pageX;

        let offsetInPercents = offsetInPixels / this.container.clientWidth * 100;
        let requestedSlideIndex = Math.ceil(this.currentIndex - offsetInPercents / 100);
        if (offsetInPixels > 0) {
            requestedSlideIndex--;
        }
        if (requestedSlideIndex < 0) {
            const offsetInPercentsToLeftBoundary = this.getOffsetInPercentsToLeft();
            offsetInPercents = offsetInPercentsToLeftBoundary +
                (offsetInPercents - offsetInPercentsToLeftBoundary) / this.settings.boundaryResistanceReduction;
        } else if (requestedSlideIndex > this.wrapper.children.length - 1) {
            const offsetInPercentsToRightBoundary = this.getOffsetInPercentsToRight();
            offsetInPercents = offsetInPercentsToRightBoundary +
                (offsetInPercents - offsetInPercentsToRightBoundary) / this.settings.boundaryResistanceReduction;
        }

        return offsetInPercents;
    }

    private getOffsetInPercentsToLeft(): number {
        return this.currentIndex * 100;
    }

    private getOffsetInPercentsToRight(): number {
        return (this.currentIndex + 1 - this.wrapper.children.length) * 100;
    }

    private isExcessBoundary(delta: number): boolean {
        return (delta > 0 && (this.currentIndex !== 0)) ||
            (delta < 0 && (this.currentIndex !== this.wrapper.children.length - 1));
    }

    // TODO Rename?
    private slideTo(offsetInPercents: number): void {
        const excessDeltaThreshold: boolean = Math.abs(offsetInPercents) > this.settings.deltaThreshold;
        const excessTimeThreshold: boolean = performance.now() - this.startTime < this.settings.timeThresholdInMs;
        const shouldSlide: boolean = (excessDeltaThreshold || excessTimeThreshold) && this.isExcessBoundary(offsetInPercents);
        if (shouldSlide) {
            // TODO Delete?
            const offset = Math.ceil(Math.abs(offsetInPercents) / 100);
            this.setTranslate(offsetInPercents > 0 ? offset * 100 : -offset * 100);
        } else {
            this.setTranslate(0);
        }
        this.wrapper.classList.add(CLASS_NAMES.MODIFIERS.ANIMATING);
    }

    private setTranslate(offsetInPercents: number): void {
        let normalizedOffsetInPercents = offsetInPercents;
        if (this.state === State.Positioning) {
            normalizedOffsetInPercents = Math.min(offsetInPercents, this.getOffsetInPercentsToLeft());
            normalizedOffsetInPercents = Math.max(normalizedOffsetInPercents, this.getOffsetInPercentsToRight());
            this.wrapper.style.transform = `translate3d(${-this.currentIndex * 100 + normalizedOffsetInPercents}%, 0, 0`;
            let normalizedCurrentIndex = this.currentIndex += -normalizedOffsetInPercents / 100;
            normalizedCurrentIndex = Math.max(normalizedCurrentIndex, 0);
            normalizedCurrentIndex = Math.min(normalizedCurrentIndex, this.wrapper.children.length - 1);
            this.currentIndex = normalizedCurrentIndex;
            this.state = State.Idle;
        } else {
            this.wrapper.style.transform = `translate3d(${-this.currentIndex * 100 + normalizedOffsetInPercents}%, 0, 0`;
        }
    }

}
