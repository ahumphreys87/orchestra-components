import i18next from 'i18next';

const resources = {};

class TranslateHelpers {
  addLocale(key, resStore) {
    resources[key] = resStore;
  }

  translate(i18nKey, locale, params) {
    let result = null;

    if (typeof params === 'string') {
      console.log(params);
      params = JSON.parse(params);
    }

    i18next
      .init({
        nsSeparator: false,
        keySeparator: false,
        lng: locale,
        resources: resources[locale]
      }, (err, translate) => {
        result = translate(i18nKey, params);
      });

    return result;
  }
}

export default new TranslateHelpers();
