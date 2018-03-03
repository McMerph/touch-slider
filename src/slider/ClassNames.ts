const ELEMENT_PREFIX = "__";
const MODIFIER_PREFIX = "_";
const BLOCK: string = "slider";
const ELEMENTS = {
    SLIDE: `${BLOCK}${ELEMENT_PREFIX}slide`,
    WRAPPER: `${BLOCK}${ELEMENT_PREFIX}wrapper`,
};

const CLASS_NAMES = {
    BLOCK,
    ELEMENTS: {
        SLIDE: ELEMENTS.SLIDE,
        WRAPPER: ELEMENTS.WRAPPER,
    },
    MODIFIERS: {
        ANIMATING: `${BLOCK}${MODIFIER_PREFIX}animating`,
    },
};

export default CLASS_NAMES;
