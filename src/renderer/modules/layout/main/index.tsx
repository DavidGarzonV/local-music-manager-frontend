import { useRef, useEffect } from 'react';
import { Steps } from 'primereact/steps';
import { MenuItem } from 'primereact/menuitem';

import { useDispatch, useSelector } from 'react-redux';
import Playlists from '../../playlist/playlists';
import SearchDirectory from '../../files/search-directory';
import LocalFilesManager from '../../files/local-files-manager';

import './styles.scss';
import { StepByFunction } from '../../../common/constants';
import SearchFiles from '../../files/search-files';
import LoadStatus from '../../songs/load-status';
import StepsHeader from './steps-header';
import { RootState } from '../../../redux/store';
import { setActiveIndex } from '../../../redux/slices/steps';
import getLabel from '../../../utils/lang';

export default function Main() {
  const alreadyRendered = useRef<Set<number>>(new Set());
  const activeIndex = useSelector(
    (state: RootState) => state.steps.activeIndex,
  );
  const dispatch = useDispatch();

  const items: MenuItem[] = [
    {
      label: getLabel('menuItems.directory'),
    },
    {
      label: getLabel('menuItems.playlist'),
    },
    {
      label: getLabel('menuItems.localFiles'),
    },
    {
      label: getLabel('menuItems.searchFiles'),
    },
    {
      label: getLabel('menuItems.loadStatus'),
    },
  ];

  const changeIndex = (index: number) => {
    dispatch(setActiveIndex(index));
  };

  const renderOrAlreadyRendered = (index: number) => {
    return activeIndex === index || alreadyRendered.current.has(index);
  };

  useEffect(() => {
    alreadyRendered.current.add(activeIndex);
  }, [activeIndex]);

  return (
    <main>
      <div className="mt-5 main-content p-3">
        <StepsHeader />
        <Steps
          model={items}
          activeIndex={activeIndex}
          onSelect={(e) => changeIndex(e.index)}
          readOnly
        />
        <div className="steps-content mt-5 mb-5">
          {renderOrAlreadyRendered(StepByFunction.directory) && (
            <div
              className="step-content-body"
              hidden={activeIndex !== StepByFunction.directory}
            >
              <SearchDirectory />
            </div>
          )}
          {renderOrAlreadyRendered(StepByFunction.playlist) && (
            <div
              className="step-content-body"
              hidden={activeIndex !== StepByFunction.playlist}
            >
              <Playlists />
            </div>
          )}
          {renderOrAlreadyRendered(StepByFunction.localFiles) && (
            <div
              className="step-content-body"
              hidden={activeIndex !== StepByFunction.localFiles}
            >
              <LocalFilesManager />
            </div>
          )}
          {renderOrAlreadyRendered(StepByFunction.searchFiles) && (
            <div
              className="step-content-body"
              hidden={activeIndex !== StepByFunction.searchFiles}
            >
              <SearchFiles />
            </div>
          )}
          {activeIndex === StepByFunction.loadStatus && (
            <div className="step-content-body">
              <LoadStatus />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
