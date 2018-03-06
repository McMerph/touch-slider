import Orientation from "./Orientation";

export default interface ISettings {
    deltaThreshold: number;
    orientation: Orientation;
    outOfBoundsResistance: number;
    slidesPerView: number;
    spaceBetween: number;
    timeThresholdInMs: number;
    transitionDurationInMs: number;
}
