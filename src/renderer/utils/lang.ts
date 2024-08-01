import { getValue } from './ls';

export default function getLabel(label: string) {
  const savedLang = getValue('lang');
  const defaultLang = savedLang || 'en';
  // eslint-disable-next-line global-require
  const langFile = require(`./lang/${defaultLang}.json`);

  if (label.includes('.')) {
    const [firstLabel, ...rest] = label.split('.');
    let nestedLabel = langFile[firstLabel] || firstLabel;
    rest.forEach((nested) => {
      nestedLabel = nestedLabel[nested] || nested;
    });
    return nestedLabel;
  }

  return langFile[label] || label;
}
