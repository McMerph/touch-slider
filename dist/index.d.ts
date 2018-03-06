export as namespace slider;

export interface ISettings {
    deltaThreshold: number;
    outOfBoundsResistance: number;
    slidesPerView: number;
    spaceBetween: number;
    timeThresholdInMs: number;
    transitionDurationInMs: number;
}

export abstract class AbstractSlider {
    constructor(container: HTMLElement, settings?: Partial<ISettings>);

    appendSlide(slide: HTMLElement): void;

    previous(): void;

    next(): void;

    slideTo(index: number): void;
}

export class HorizontalSlider extends AbstractSlider {
}

export class VerticalSlider extends AbstractSlider {
}
