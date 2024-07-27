export const setValue = (name: string, value: string) => {
  window.localStorage.setItem(name, value);
};

export const getValue = <T = string>(name: string): T | null => {
  const data = window.localStorage.getItem(name) ?? '';
  if (data === '') {
    return data as T;
  }

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    if (typeof data === 'string') {
      return data as T;
    }
  }

  return null;
};

export const removeItem = (name: string) => {
  window.localStorage.removeItem(name);
};

export const updateJsonStringValue = (name: string, dataJson: string[]) => {
  try {
    const currentValue = getValue(name) as string[];
    const newValue = [...currentValue, ...dataJson];
    setValue(name, JSON.stringify(newValue));
    // eslint-disable-next-line no-empty
  } catch (error) {}
};
