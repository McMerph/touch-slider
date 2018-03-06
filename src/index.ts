import "classlist-polyfill";

import "normalize.css/normalize.css";

import "./index.css";
import "./slider/index.css";

import Slider from "./slider/index";
import Orientation from "./slider/Orientation";

const handleHorizontalSlider: () => void = () => {
    const getNextIndex: () => number = counter();

    const touchTestElement: HTMLElement = document.querySelector(".horizontal-test") as HTMLElement;
    const slider: Slider = new Slider(touchTestElement, {
        slidesPerView: 2,
        spaceBetween: 10,
    });
    slider.appendSlide(getDiv("red", getNextIndex));
    slider.appendSlide(getDiv("green", getNextIndex));
    slider.appendSlide(getDiv("blue", getNextIndex));
    slider.appendSlide(getDiv("red", getNextIndex));
    slider.appendSlide(getDiv("green", getNextIndex));
    slider.appendSlide(getDiv("blue", getNextIndex));

    const previousElement: HTMLElement = document.querySelector(".horizontal-test__previous") as HTMLElement;
    previousElement.addEventListener("click", () => slider.previous());

    const nextElement: HTMLElement = document.querySelector(".horizontal-test__next") as HTMLElement;
    nextElement.addEventListener("click", () => slider.next());

    const form: HTMLElement = document.querySelector(".horizontal-test__form") as HTMLElement;
    form.addEventListener("submit", (event: Event) => {
        event.preventDefault();
        const input: HTMLInputElement = document.querySelector(".horizontal-test__index") as HTMLInputElement;
        if (isNumeric(input.value)) {
            const index: number = Number.parseInt(input.value);
            slider.slideTo(index);
        }
    });
};

const handleVerticalSlider: () => void = () => {
    const getNextIndex: () => number = counter();

    const touchTestElement: HTMLElement = document.querySelector(".vertical-test") as HTMLElement;
    const slider: Slider = new Slider(touchTestElement, {
        orientation: Orientation.Vertical,
        slidesPerView: 2,
        spaceBetween: 10,
    });
    slider.appendSlide(getDiv("red", getNextIndex));
    slider.appendSlide(getDiv("green", getNextIndex));
    slider.appendSlide(getDiv("blue", getNextIndex));
    slider.appendSlide(getDiv("red", getNextIndex));
    slider.appendSlide(getDiv("green", getNextIndex));
    slider.appendSlide(getDiv("blue", getNextIndex));

    const previousElement: HTMLElement = document.querySelector(".vertical-test__previous") as HTMLElement;
    previousElement.addEventListener("click", () => slider.previous());

    const nextElement: HTMLElement = document.querySelector(".vertical-test__next") as HTMLElement;
    nextElement.addEventListener("click", () => slider.next());

    const form: HTMLElement = document.querySelector(".vertical-test__form") as HTMLElement;
    form.addEventListener("submit", (event: Event) => {
        event.preventDefault();
        const input: HTMLInputElement = document.querySelector(".vertical-test__index") as HTMLInputElement;
        if (isNumeric(input.value)) {
            const index: number = Number.parseInt(input.value);
            slider.slideTo(index);
        }
    });
};

document.addEventListener("DOMContentLoaded", () => {
    handleHorizontalSlider();
    handleVerticalSlider();
});

function isNumeric(n: string): boolean {
    return !isNaN(parseFloat(n)) && isFinite(Number.parseInt(n));
}

const counter: () => () => number = () => {
    let index = 0;
    return () => index++;
};

const getDiv: (className: string, getNextIndex: () => number) => HTMLElement = (className, getNextIndex) => {
    const div: HTMLDivElement = document.createElement("div");
    div.classList.add("dummy", className);
    div.textContent = getNextIndex().toString();

    return div;
};
