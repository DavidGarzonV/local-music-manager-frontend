import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';

import {
  FinishLoadDataType,
  LocalFile,
  SearchParams,
  SongResult,
  YtSong,
} from '../../../common/types';
import Loading from '../../../components/loading';
import { RootState } from '../../../redux/store';
import { StepByFunction } from '../../../common/constants';
import AddSongs from '../../songs/add-songs';
import {
  setFinishLoad,
  setFinishedSearch,
} from '../../../redux/slices/results';
import { setLoadingSearch } from '../../../redux/slices/loading';
import fetchRequest from '../../../utils/fetch';
import SearchSongsResults from '../../songs/search-songs-results';
import {
  addToLoadResults,
  resetSongResults,
  setAlreadyInList,
  setSearchResults,
} from '../../../redux/slices/songs';
import { setActiveIndex, setIsLastSearch } from '../../../redux/slices/steps';
import MessageTemplate from '../../../components/message-template';
import HelpTemplate from '../../../components/help-template';
import getLabel from '../../../utils/lang';

const SEARCH_LIMIT = 15;

export default function SearchFiles() {
  const searchResults = useRef<SongResult[]>([]);
  const localFilesToProcess = useRef<LocalFile[]>([]);
  const playListTracksQueried = useRef(false);

  const firstLoad = useRef(false);
  const activeIndex = useSelector(
    (state: RootState) => state.steps.activeIndex,
  );
  const selectedFiles = useSelector(
    (state: RootState) => state.files.selectedLocalFiles,
  );
  const finishedSearch = useSelector(
    (state: RootState) => state.results.finishedSearch,
  );
  const isLoading = useSelector(
    (state: RootState) => state.loading.loadingSearch,
  );
  const finishLoad = useSelector(
    (state: RootState) => state.results.finishLoad,
  );
  const playlist = useSelector((state: RootState) => state.playlist.playlist);
  const [addingSongs, setAddingSongs] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [saveResult, setSaveResult] = useState(true);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    limit: SEARCH_LIMIT,
    offset: 0,
  });
  const dispatch = useDispatch();

  const getSongsToSearch = useCallback(
    (params: SearchParams) => {
      const songsFiltered = selectedFiles.slice(
        params.offset,
        params.offset + params.limit,
      );

      return songsFiltered.map((item) => ({
        identifier: item.id,
        title: item.title,
        artist: item.artist,
        originalName: item.file_name,
        completePath: item.complete_path,
      }));
    },
    [selectedFiles],
  );

  const setGlobalSearchResults = useCallback(
    (searchResultsData: SongResult[]) => {
      const data = searchResultsData.reduce((acc, item) => {
        const mappedresults = item.SearchResults.AdditionalResults.map(
          (current) => ({
            ...current,
            fileName: item.SongOriginalName,
          }),
        );

        const response = [...acc, ...mappedresults];
        if (item.SearchResults.BestMatch) {
          response.push({
            ...item.SearchResults.BestMatch,
            fileName: item.SongOriginalName,
          });
        }
        return response;
      }, [] as YtSong[]);

      dispatch(setSearchResults(data));
    },
    [dispatch],
  );

  const calculateProgress = useCallback(() => {
    const total = selectedFiles.length;
    const { offset, limit } = searchParams;
    const advance = limit + offset;
    const progress = total > 0 ? (advance * 100) / total : 0;
    if (progress >= 100) {
      return 100;
    }
    return Math.round(progress);
  }, [searchParams, selectedFiles]);

  const searchSongs = useCallback(
    async (firstTime: boolean, params: SearchParams) => {
      if (finishedSearch) {
        return;
      }
      if (!playListTracksQueried.current) {
        setLoadingPlaylist(true);
        const playListtracks = await fetchRequest<{ Tracks: string[] }>(
          `playlists/${playlist?.playlistId}`,
        );

        if (playListtracks?.Tracks) {
          dispatch(setAlreadyInList(playListtracks.Tracks));
        }
        setLoadingPlaylist(false);
        playListTracksQueried.current = true;
      }
      dispatch(setLoadingSearch(true));

      const data = await fetchRequest<{ Songs: SongResult[] }>(
        'songs/search-songs',
        {
          method: 'POST',
          body: {
            songs: getSongsToSearch(params),
          },
        },
      ).then((resp) => resp?.Songs ?? []);

      searchResults.current = data;
      setGlobalSearchResults(data);

      if (firstTime) {
        dispatch(setLoadingSearch(false));
      }
    },
    [
      dispatch,
      getSongsToSearch,
      finishedSearch,
      playlist,
      setGlobalSearchResults,
    ],
  );

  const continueSearch = useCallback(() => {
    dispatch(setLoadingSearch(true));
    setAddingSongs(true);
  }, [dispatch]);

  const finishLoadSongs = (data: FinishLoadDataType) => {
    const { totalSongs, notAddedSongs, success } = data;

    dispatch(
      addToLoadResults({
        totalSongs,
        notAddedSongs,
      }),
    );
    setAddingSongs(false);

    setSaveResult(success);

    const newOffset = searchParams.offset + searchParams.limit;
    const localSearchParams = { limit: SEARCH_LIMIT, offset: newOffset };

    if (newOffset >= selectedFiles.length || finishLoad) {
      searchResults.current = [];
      dispatch(setLoadingSearch(false));
      if (success) {
        dispatch(setFinishedSearch(true));
        dispatch(setActiveIndex(StepByFunction.loadStatus));
      }
    } else {
      setSearchParams(localSearchParams);
      searchSongs(true, localSearchParams);
    }
  };

  const getResultsText = () => {
    let totalToShow = searchParams.offset + searchParams.limit;
    if (totalToShow > selectedFiles.length) {
      totalToShow = selectedFiles.length;
    }

    return `${getLabel('pagination.showingFrom')} ${
      searchParams.offset + 1
    } ${getLabel('pagination.to')} ${totalToShow} ${getLabel(
      'pagination.total',
    )} ${selectedFiles.length}`;
  };

  useEffect(() => {
    const handleFinishLoad = async () => {
      if (finishLoad) {
        continueSearch();
      }
    };
    handleFinishLoad();
  }, [finishLoad, continueSearch]);

  useEffect(() => {
    const thereAreDifferencesInSelection = () => {
      const difference = selectedFiles.filter(
        (x) => !localFilesToProcess.current.includes(x),
      );
      return (
        selectedFiles.length !== localFilesToProcess.current.length ||
        difference.length > 0
      );
    };

    let localSearchParams = { ...searchParams };

    if (thereAreDifferencesInSelection()) {
      localSearchParams = { limit: SEARCH_LIMIT, offset: 0 };
      playListTracksQueried.current = false;

      setSearchParams(localSearchParams);
      dispatch(setFinishedSearch(false));
      dispatch(setIsLastSearch(false));
      dispatch(setFinishLoad(false));
      dispatch(resetSongResults());
      firstLoad.current = false;
    }

    if (
      selectedFiles.length &&
      activeIndex === StepByFunction.searchFiles &&
      !firstLoad.current
    ) {
      firstLoad.current = true;
      searchSongs(true, localSearchParams);
    }

    localFilesToProcess.current = selectedFiles;
  }, [selectedFiles, activeIndex, searchSongs, searchParams, dispatch]);

  const progress = calculateProgress();

  useEffect(() => {
    if (progress === 100) {
      dispatch(setIsLastSearch(true));
    }
  }, [progress, dispatch]);

  return (
    <div>
      <div>
        <h4 className="text-color-secondary">
          {getLabel('helps.searchFiles')}
        </h4>
        <HelpTemplate identifier="search-files">
          <p className="flex align-content-center justify-content-center">
            {getLabel('searchFiles.default')}{' '}
            <i
              className="pi pi-angle-right pl-2 pr-2"
              style={{
                color: 'var(--surface-700)',
                fontSize: '18px',
              }}
            />{' '}
            {getLabel('searchFiles.nameSong')}
          </p>
          <p
            className="flex align-content-center justify-content-center"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: getLabel('searchFiles.selecting'),
            }}
          />
        </HelpTemplate>
      </div>

      <div className="flex justify-content-center">
        <div className="mt-3 flex flex-row align-items-center">
          {addingSongs && !finishedSearch && (
            <AddSongs finishLoadSongs={finishLoadSongs} />
          )}

          {(isLoading || addingSongs || loadingPlaylist) && (
            <>
              <Loading />

              {addingSongs && (
                <span className="block">
                  {getLabel('searchFiles.addingSongs')}
                </span>
              )}
              {isLoading && !addingSongs && (
                <span className="block">
                  {getLabel('searchFiles.searching')}
                </span>
              )}
              {loadingPlaylist && (
                <span className="block">
                  {getLabel('searchFiles.preparing')}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {!isLoading && !addingSongs && !loadingPlaylist && (
        <div>
          {!finishedSearch && (
            <>
              <strong className="mb-1">{getResultsText()}</strong>
              <ProgressBar value={progress} />
              <Divider />
              <SearchSongsResults
                songs={searchResults.current}
                rowsToShow={SEARCH_LIMIT}
              />
              <Divider />
            </>
          )}
          <div className="flex justify-content-end">
            {!finishedSearch && progress < 100 && (
              <div className="right-0 bottom-0 ml-2">
                <Button
                  label={getLabel('searchFiles.addAndContinue')}
                  severity="success"
                  icon="pi pi-plus"
                  onClick={continueSearch}
                />
              </div>
            )}
            {finishedSearch && saveResult && (
              <Message
                className="border-primary w-full justify-content-start"
                severity="success"
                style={{
                  border: 'solid #696cff',
                  borderWidth: '0 0 0 6px',
                  color: '#696cff',
                }}
                content={
                  <MessageTemplate icon="pi-check-circle" severity="success">
                    {getLabel('searchFiles.searchFinished')}
                  </MessageTemplate>
                }
              />
            )}
            {finishedSearch && !saveResult && (
              <Message
                className="border-primary w-full justify-content-start"
                severity="error"
                content={
                  <MessageTemplate
                    icon="pi-exclamation-triangle"
                    severity="error"
                  >
                    {getLabel('searchFiles.searchFinishedError')}
                  </MessageTemplate>
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
