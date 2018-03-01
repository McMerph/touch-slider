const ELEMENT_PREFIX = "__";
const MODIFIER_PREFIX = "_";
const BLOCK: string = "slider";
const ELEMENTS = {
    SLIDE: `${BLOCK}${ELEMENT_PREFIX}slide`,
};

const CLASS_NAMES = {
    BLOCK,
    ELEMENTS: {
        SLIDE: {
            MODIFIERS: {
                ANIMATING: `${ELEMENTS.SLIDE}${MODIFIER_PREFIX}animating`,
                CURRENT: `${ELEMENTS.SLIDE}${MODIFIER_PREFIX}current`,
                HIDDEN: `${ELEMENTS.SLIDE}${MODIFIER_PREFIX}hidden`,
                LEFT: `${ELEMENTS.SLIDE}${MODIFIER_PREFIX}left`,
                RIGHT: `${ELEMENTS.SLIDE}${MODIFIER_PREFIX}right`,
            },
            NAME: `${ELEMENTS.SLIDE}`,
        },
    },
};

export default CLASS_NAMES;
