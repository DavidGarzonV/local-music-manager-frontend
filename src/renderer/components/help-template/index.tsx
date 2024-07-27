import { Message } from 'primereact/message';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { useDispatch, useSelector } from 'react-redux';

import MessageTemplate from '../message-template';
import { getValue, removeItem, setValue } from '../../utils/ls';
import { RootState } from '../../redux/store';
import './styles.scss';
import {
  ClosedHelps,
  StepsWithHelp,
  setClosedHelps,
} from '../../redux/slices/steps';
import getLabel from '../../utils/lang';

type HelpTemplateProps = {
  children: React.ReactNode;
  identifier: string;
};

export default function HelpTemplate({
  identifier,
  children,
}: HelpTemplateProps) {
  const firstTime = useRef(true);
  const [additionalClass, setAdditionalClass] = useState('');
  const [closed, setClosed] = useState(true);
  const helpName = `${identifier}-help` as StepsWithHelp;
  const closedHelps = useSelector(
    (state: RootState) => state.steps.closedHelps,
  );
  const dispatch = useDispatch();

  const closeDispatch = () => {
    const data: ClosedHelps = {};
    data[helpName] = true;

    dispatch(setClosedHelps(data));
  };

  const closeMessage = () => {
    setAdditionalClass('fadeoutup');
    setTimeout(() => {
      setValue(helpName, 'true');
      setClosed(true);
      closeDispatch();
    }, 300);
  };

  useEffect(() => {
    if (!firstTime.current) {
      if (closedHelps[helpName] === true) {
        setClosed(true);
      } else if (closedHelps[helpName] === false && closed) {
        setClosed(false);
        removeItem(helpName);
        setAdditionalClass('fadeinup');
        setTimeout(() => {
          setAdditionalClass('');
        }, 300);
      }
    }

    firstTime.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closedHelps]);

  useEffect(() => {
    const statusClosed = getValue(helpName);
    if (statusClosed) {
      closeDispatch();
    } else if (statusClosed === '') {
      setClosed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [helpName]);

  return (
    <Message
      style={{
        border: 'solid #696cff',
        borderWidth: '0 0 0 6px',
        color: '#696cff',
        position: 'relative',
        display: closed ? 'none' : 'flex',
      }}
      className={`help-message border-primary w-full justify-content-start mb-4 animation-duration-300 ${additionalClass}`}
      severity="info"
      content={() => (
        <>
          <MessageTemplate icon="pi-info-circle" severity="info">
            {children}
          </MessageTemplate>
          <div className="close-icon">
            <Button
              icon="pi pi-times"
              link
              title={getLabel('help.close')}
              onClick={closeMessage}
            />
          </div>
        </>
      )}
    />
  );
}
