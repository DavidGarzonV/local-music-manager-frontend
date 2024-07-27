import { Dialog } from 'primereact/dialog';
import { Message } from 'primereact/message';
import { useEffect, useRef, useState } from 'react';
import getLabel from '../../utils/lang';

export default function NetworkStatus() {
  const definedEvents = useRef(false);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!definedEvents.current) {
      window.addEventListener('offline', () => setVisible(!navigator.onLine));
      window.addEventListener('online', () => setVisible(!navigator.onLine));
      definedEvents.current = true;
    }
  }, []);

  return (
    <Dialog
      header={getLabel('info')}
      visible={visible}
      onHide={() => {}}
      closable={false}
      closeOnEscape={false}
      dismissableMask={false}
    >
      <Message severity="warn" text={getLabel('noInternet')} />
    </Dialog>
  );
}
