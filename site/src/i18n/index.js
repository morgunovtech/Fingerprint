import ru from './ru.js?v=3.1.1';
import en from './en.js?v=3.1.1';
import uz from './uz.js?v=3.1.1';

export const I18N = { ru, en, uz };

// The strings of a language, Russian when the code is unknown.
export function textsFor(lang) {
  return I18N[lang] || I18N.ru;
}
