import "normalize.css/normalize.css";
import "./index.css";
import Slider from "./slider/index";

document.addEventListener("DOMContentLoaded", () => {
    const touchTestElement: HTMLElement = document.querySelector(".touch-test") as HTMLElement;
    touchTestElement.appendChild(getDiv("red"));
    touchTestElement.appendChild(getDiv("green"));
    touchTestElement.appendChild(getDiv("blue"));
    touchTestElement.appendChild(getDiv("red"));
    touchTestElement.appendChild(getDiv("green"));
    touchTestElement.appendChild(getDiv("blue"));
    new Slider(touchTestElement);
});

const getDiv: (className: string) => HTMLElement = (className) => {
    const div: HTMLDivElement = document.createElement("div");
    div.classList.add(className);

    return div;
};
