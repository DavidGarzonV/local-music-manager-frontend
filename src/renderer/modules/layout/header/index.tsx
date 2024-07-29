import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';
import { confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { useEffect } from 'react';

import fetchRequest from '../../../utils/fetch';
import { setLang, setLoggedIn } from '../../../redux/slices/login';
import { getValue, removeItem, setValue } from '../../../utils/ls';
import './styles.scss';
import {
  ClosedHelps,
  StepsWithHelp,
  setClosedHelps,
} from '../../../redux/slices/steps';
import { RootState } from '../../../redux/store';
import { StepByFunction } from '../../../common/constants';
import getLabel from '../../../utils/lang';

const helpsByIndex: Record<number, string> = {
  [StepByFunction.playlist]: 'playlists-help',
  [StepByFunction.directory]: 'directory-help',
  [StepByFunction.localFiles]: 'localfiles-help',
  [StepByFunction.searchFiles]: 'search-files',
};

export default function Header() {
  const dispatch = useDispatch();
  const activeIndex = useSelector(
    (state: RootState) => state.steps.activeIndex,
  );
  const lang = useSelector((state: RootState) => state.login.lang);

  const logout = async () => {
    confirmDialog({
      message: getLabel('logout.confirm'),
      header: 'Info',
      icon: 'pi pi-info-circle',
      className: 'popoverFinish',
      defaultFocus: 'reject',
      acceptLabel: getLabel('yes'),
      rejectLabel: 'No',
      accept: async () => {
        await fetchRequest('auth/logout', {
          method: 'POST',
        });
        dispatch(setLoggedIn(false));
        removeItem('accessToken');
      },
    });
  };

  const enableHelp = () => {
    const data: ClosedHelps = {};
    const activeHelp = helpsByIndex[activeIndex] as StepsWithHelp;
    data[activeHelp] = false;

    dispatch(setClosedHelps(data));
  };

  const onchangeLang = (selectedLang: string) => {
    setValue('lang', selectedLang);
    dispatch(setLang(selectedLang));
  };

  useEffect(() => {
    const savedLang = getValue('lang');
    if (savedLang) {
      dispatch(setLang(savedLang));
    }
  }, [dispatch]);

  return (
    <header className="app-header">
      <div className="flex flex-row justify-content-between">
        <h1>Local Music Manager</h1>

        <div>
          <Dropdown
            value={lang}
            onChange={(e) => onchangeLang(e.value)}
            options={[
              { name: 'EN', value: 'en' },
              { name: 'ES', value: 'es' },
            ]}
            optionLabel="name"
            placeholder={lang}
            className="mr-3"
          />

          <Button
            icon="pi pi-question"
            rounded
            outlined
            title={getLabel('help.enableHelp')}
            aria-label={getLabel('help.help')}
            onClick={enableHelp}
          />

          <Button
            icon="pi pi-sign-out"
            label={getLabel('logout.logout')}
            link
            onClick={logout}
          />
        </div>
      </div>
    </header>
  );
}
