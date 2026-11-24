import ru from './ru.js';
import en from './en.js';
import uz from './uz.js';

export const I18N = { ru, en, uz };

// The strings of a language, Russian when the code is unknown.
export function textsFor(lang) {
  return I18N[lang] || I18N.ru;
}
