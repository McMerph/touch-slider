import AbstractSlider from "./AbstractSlider";

export default class HorizontalSlider extends AbstractSlider {

    protected setSlideSize(slide: HTMLElement): void {
        slide.style.width = `${this.getSlideSize()}px`;
    }

    protected setSlideMargin(slide: HTMLElement): void {
        slide.style.marginRight = `${this.settings.spaceBetween}px`;
    }

    protected getWrapperSize(): number {
        return this.wrapper.clientWidth;
    }

    protected isSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) >
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    protected getPixelsDelta(touch: Touch): number {
        return touch.pageX - this.startTouch.pageX;
    }

    protected getTranslate3dParameters(): string {
        return `${this.totalOffset}px, 0, 0`;
    }

}
