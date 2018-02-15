import "normalize.css/normalize.css";
import "./index.css";
import Slider from "./slider/index";

document.addEventListener("DOMContentLoaded", () => {
    const element: HTMLElement = document.querySelector(".touch-test") as HTMLElement;
    new Slider(element);
});
