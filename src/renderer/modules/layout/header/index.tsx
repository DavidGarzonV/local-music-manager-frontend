import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';
import { confirmDialog } from 'primereact/confirmdialog';

import fetchRequest from '../../../utils/fetch';
import { setLoggedIn } from '../../../redux/slices/login';
import { removeItem } from '../../../utils/ls';
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

  return (
    <header className="app-header">
      <div className="flex flex-row justify-content-between">
        <h1>Local Music Manager</h1>

        <div>
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
