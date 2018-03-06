import AbstractSlider from "./AbstractSlider";
import CLASS_NAMES from "./ClassNames";

export default class VerticalSlider extends AbstractSlider {

    protected getWrapperClassNames(): string[] {
        return [CLASS_NAMES.ELEMENTS.WRAPPER.MODIFIERS.VERTICAL];
    }

    protected setSlideSize(slide: HTMLElement): void {
        slide.style.height = `${this.getSlideSize()}px`;
    }

    protected setSlideMargin(slide: HTMLElement): void {
        slide.style.marginBottom = `${this.settings.spaceBetween}px`;
    }

    protected getSlideSize(): number {
        const { spaceBetween } = this.settings;
        return (this.wrapper.clientHeight - (this.slidesPerView - 1) * spaceBetween) / this.slidesPerView;
    }

    protected isSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) <
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    protected getPixelsDelta(touch: Touch): number {
        return touch.pageY - this.startTouch.pageY;
    }

    protected translate(): void {
        this.wrapper.style.transform = `translate3d(0, ${this.totalOffset}px,  0`;
    }

}
