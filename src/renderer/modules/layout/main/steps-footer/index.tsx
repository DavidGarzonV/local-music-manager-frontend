import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';
import { confirmDialog } from 'primereact/confirmdialog';
import { RootState } from '../../../../redux/store';
import { StepByFunction } from '../../../../common/constants';
import {
  resetVideosSelection,
  setFinishLoad,
  setFinishedSearch,
} from '../../../../redux/slices/results';
import { setPlaylistId } from '../../../../redux/slices/playlist';
import { resetFilesSelection } from '../../../../redux/slices/files';
import { resetSongResults } from '../../../../redux/slices/songs';
import {
  setActiveIndex,
  setIsLastSearch,
} from '../../../../redux/slices/steps';
import { setFolderSelected } from '../../../../redux/slices/folderAndFiles';
import { sendEventToGetLocalJSONFile } from '../../../../utils';
import getLabel from '../../../../utils/lang';

export default function StepsFooter() {
  const playlist = useSelector((state: RootState) => state.playlist.playlist);
  const directory = useSelector(
    (state: RootState) => state.folderAndFiles.folderSelected.directory,
  );
  const selectedLocalFiles = useSelector(
    (state: RootState) => state.files.selectedLocalFiles,
  );
  const isLoadingSearch = useSelector(
    (state: RootState) => state.loading.loadingSearch,
  );
  const finishedSearch = useSelector(
    (state: RootState) => state.results.finishedSearch,
  );
  const totalManagedSongs = useSelector(
    (state: RootState) => state.songs.totalManagedSongs,
  );
  const activeIndex = useSelector(
    (state: RootState) => state.steps.activeIndex,
  );
  const isLastSearch = useSelector(
    (state: RootState) => state.steps.isLastSearch,
  );

  const dispatch = useDispatch();

  const finishLoad = () => {
    dispatch(setFinishedSearch(true));
    dispatch(setActiveIndex(StepByFunction.loadStatus));
  };

  const confirmFinishLoad = () => {
    if (!finishedSearch) {
      if (isLastSearch) {
        dispatch(setFinishLoad(true));
      } else {
        confirmDialog({
          message: getLabel('confirmFinishLoad'),
          header: getLabel('info'),
          icon: 'pi pi-info-circle',
          className: 'popoverFinish',
          defaultFocus: 'reject',
          acceptLabel: getLabel('yes'),
          rejectLabel: 'No',
          accept: () => {
            dispatch(setFinishLoad(true));
          },
        });
      }
    } else {
      finishLoad();
    }
  };

  const resetSongsResults = () => {
    dispatch(resetVideosSelection());
    dispatch(resetSongResults());
    dispatch(setFinishedSearch(false));
    dispatch(setFinishLoad(false));
    dispatch(setIsLastSearch(false));
    dispatch(resetFilesSelection());
  };

  const resetProcess = () => {
    dispatch(setPlaylistId(null));
    dispatch(setFolderSelected({ directory: null, filesInFolder: 0 }));
    resetSongsResults();
    dispatch(setActiveIndex(StepByFunction.directory));
  };

  const returnToLocalFiles = () => {
    resetSongsResults();
    sendEventToGetLocalJSONFile('processed');
    dispatch(setActiveIndex(StepByFunction.localFiles));
  };

  const changeIndex = (newIndex: number) => {
    if (
      newIndex >= StepByFunction.directory &&
      newIndex <= StepByFunction.loadStatus
    ) {
      dispatch(setActiveIndex(newIndex));
    }
  };

  const noPlaylist = activeIndex === StepByFunction.playlist && !playlist;
  const noDirectory = activeIndex === StepByFunction.directory && !directory;
  const noSelectedFiles =
    activeIndex === StepByFunction.localFiles &&
    selectedLocalFiles.length === 0;
  const noSelectedVideos = false;
  const noFinishedSearch =
    activeIndex === StepByFunction.searchFiles && !finishedSearch;
  const isSearchingAndHaveSongs =
    activeIndex === StepByFunction.searchFiles &&
    !finishedSearch &&
    totalManagedSongs > 0;

  const isNextDisabled =
    noPlaylist ||
    noDirectory ||
    noSelectedFiles ||
    noSelectedVideos ||
    noFinishedSearch ||
    isLoadingSearch;

  const isPreviousDisabled = isLoadingSearch || isSearchingAndHaveSongs;

  return (
    <div className="steps-footer flex justify-content-between">
      <div className="left-0 bottom-0">
        <Button
          label={getLabel('steps.previous')}
          icon="pi pi-angle-left"
          hidden={activeIndex === StepByFunction.directory}
          onClick={() => changeIndex(activeIndex - 1)}
          disabled={isPreviousDisabled}
        />
      </div>
      <div className="right-0 bottom-0">
        <Button
          label={getLabel('steps.next')}
          icon="pi pi-angle-right"
          hidden={activeIndex === StepByFunction.loadStatus}
          onClick={() => changeIndex(activeIndex + 1)}
          disabled={isNextDisabled}
        />
        {activeIndex === StepByFunction.searchFiles && !finishedSearch && (
          <Button
            className="ml-2"
            label={getLabel('steps.finishLoad')}
            icon="pi pi-check-circle"
            severity={isLastSearch ? 'success' : 'warning'}
            onClick={confirmFinishLoad}
            disabled={isLoadingSearch}
          />
        )}
        {activeIndex === StepByFunction.loadStatus && (
          <>
            <Button
              className="ml-2"
              label={getLabel('steps.returnLocalFiles')}
              icon="pi pi-arrow-left"
              severity="secondary"
              onClick={returnToLocalFiles}
            />

            <Button
              className="ml-2"
              label={getLabel('steps.reset')}
              icon="pi pi-refresh"
              severity="secondary"
              onClick={resetProcess}
            />
          </>
        )}
      </div>
    </div>
  );
}
