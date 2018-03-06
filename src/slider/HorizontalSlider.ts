import AbstractSlider from "./AbstractSlider";

export default class HorizontalSlider extends AbstractSlider {

    protected getWrapperClassNames(): string[] {
        return [];
    }

    protected setSlideSize(slide: HTMLElement): void {
        slide.style.width = `${this.getSlideSize()}px`;
    }

    protected setSlideMargin(slide: HTMLElement): void {
        slide.style.marginRight = `${this.settings.spaceBetween}px`;
    }

    protected getSlideSize(): number {
        const { spaceBetween } = this.settings;
        return (this.wrapper.clientWidth - (this.slidesPerView - 1) * spaceBetween) / this.slidesPerView;
    }

    protected isSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) >
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    protected getPixelsDelta(touch: Touch): number {
        return touch.pageX - this.startTouch.pageX;
    }

    protected translate(): void {
        this.wrapper.style.transform = `translate3d(${this.totalOffset}px, 0, 0`;
    }

}
