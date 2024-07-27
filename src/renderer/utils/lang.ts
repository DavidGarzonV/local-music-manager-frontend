export default function getLabel(label: string) {
  const defaultLang = 'en';
  // eslint-disable-next-line global-require
  const langFile = require(`./lang/${defaultLang}.json`);

  if (label.includes('.')) {
    const [firstLabel, ...rest] = label.split('.');
    let nestedLabel = langFile[firstLabel];
    rest.forEach((nested) => {
      nestedLabel = nestedLabel[nested];
    });
    return nestedLabel;
  }

  return langFile[label] || label;
}
