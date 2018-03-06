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
        WRAPPER: {
            MODIFIERS: {
                VERTICAL: `${ELEMENTS.WRAPPER}${MODIFIER_PREFIX}vertical`,
            },
            NAME: ELEMENTS.WRAPPER,
        },
    },
};

export default CLASS_NAMES;
