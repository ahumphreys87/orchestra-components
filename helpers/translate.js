import Polyglot from 'node-polyglot';

const polyglot = new Polyglot();

class TranslateHelpers {
  setTranslations(locale, translations) {
    polyglot.locale(locale);
    polyglot.replace(translations);
  }

  translate(i18nKey, params) {
    if (!i18nKey) {
      return;
    }

    if (typeof params === 'string') {
      params = JSON.parse(params);
    }

    return polyglot.t(i18nKey, params);
  }
}

export default new TranslateHelpers();
