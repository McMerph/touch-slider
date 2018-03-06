import "classlist-polyfill";

import "normalize.css/normalize.css";

import "./index.css";
import "./slider/index.css";

import Slider from "./slider/index";

document.addEventListener("DOMContentLoaded", () => {
    const touchTestElement: HTMLElement = document.querySelector(".touch-test") as HTMLElement;
    const slider: Slider = new Slider(touchTestElement, {
        slidesPerView: 2,
        spaceBetween: 10,
    });
    slider.appendSlide(getDiv("red"));
    slider.appendSlide(getDiv("green"));
    slider.appendSlide(getDiv("blue"));
    slider.appendSlide(getDiv("red"));
    slider.appendSlide(getDiv("green"));
    slider.appendSlide(getDiv("blue"));

    const previousElement: HTMLElement = document.querySelector(".previous") as HTMLElement;
    previousElement.addEventListener("click", () => slider.previous());

    const nextElement: HTMLElement = document.querySelector(".next") as HTMLElement;
    nextElement.addEventListener("click", () => slider.next());

    const form: HTMLElement = document.querySelector(".form") as HTMLElement;
    form.addEventListener("submit", (event: Event) => {
        event.preventDefault();
        const input: HTMLInputElement = document.querySelector(".index") as HTMLInputElement;
        if (isNumeric(input.value)) {
            const index: number = Number.parseInt(input.value);
            slider.slideTo(index);
        }
    });
});

function isNumeric(n: string): boolean {
    return !isNaN(parseFloat(n)) && isFinite(Number.parseInt(n));
}

const counter: () => () => number = () => {
    let index = 0;
    return () => index++;
};

const getNextIndex: () => number = counter();

const getDiv: (className: string) => HTMLElement = (className) => {
    const div: HTMLDivElement = document.createElement("div");
    div.classList.add("dummy", className);
    div.textContent = getNextIndex().toString();

    return div;
};
