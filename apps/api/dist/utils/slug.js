"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUniqueSlug = exports.generateSlug = exports.transliterate = void 0;
const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '',
    'ю': 'yu', 'я': 'ya', "'": '', "\u2019": '',
};
const transliterate = (text) => {
    return text
        .toLowerCase()
        .split('')
        .map(char => translitMap[char] ?? char)
        .join('');
};
exports.transliterate = transliterate;
const generateSlug = (text) => {
    return (0, exports.transliterate)(text)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
};
exports.generateSlug = generateSlug;
const ensureUniqueSlug = async (baseSlug, checkExists) => {
    let slug = baseSlug;
    let counter = 1;
    while (await checkExists(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
};
exports.ensureUniqueSlug = ensureUniqueSlug;
//# sourceMappingURL=slug.js.map