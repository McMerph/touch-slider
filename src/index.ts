import "normalize.css/normalize.css";
import "./index.css";

import Slider from "./slider/index";

document.addEventListener("DOMContentLoaded", () => {
    const touchTestElement: HTMLElement = document.querySelector(".touch-test") as HTMLElement;
    const slider: Slider = new Slider(touchTestElement);
    slider.appendSlide(getDiv("red"));
    slider.appendSlide(getDiv("green"));
    slider.appendSlide(getDiv("blue"));
    slider.appendSlide(getDiv("red"));
    slider.appendSlide(getDiv("green"));
    slider.appendSlide(getDiv("blue"));
});

const getDiv: (className: string) => HTMLElement = (className) => {
    const div: HTMLDivElement = document.createElement("div");
    div.classList.add(className);

    return div;
};
