import AbstractSlider from "./AbstractSlider";
import CLASS_NAMES from "./ClassNames";

export default class VerticalSlider extends AbstractSlider {

    protected getWrapperClassNames(): string[] {
        return [CLASS_NAMES.ELEMENTS.WRAPPER.MODIFIERS.VERTICAL];
    }

    protected getSizeProperty(): string {
        return "height";
    }

    protected getMarginProperty(): string {
        return "marginBottom";
    }

    protected getWrapperSize(): number {
        return this.wrapper.clientHeight;
    }

    protected isSwipe(touch: Touch): boolean {
        return Math.abs(this.startTouch.pageX - touch.pageX) <
            Math.abs(this.startTouch.pageY - touch.pageY);
    }

    protected getPixelsDelta(touch: Touch): number {
        return touch.pageY - this.startTouch.pageY;
    }

    protected getTranslate3dParameters(): string {
        return `0, ${this.totalOffset}px, 0`;
    }

}
